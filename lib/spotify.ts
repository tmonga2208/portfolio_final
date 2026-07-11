const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const PLAYLIST_ENDPOINT = "https://api.spotify.com/v1/playlists";

interface SpotifyToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface SpotifyArtist {
    name: string;
}

interface SpotifyAlbum {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
}

interface SpotifyTrack {
    name: string;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
    duration_ms: number;
    uri: string;
    external_urls: {
        spotify: string;
    };
}

// Spotify tokens live for an hour, so refreshing on every call burns quota for
// nothing. Cache across invocations and expire a minute early for clock skew.
const TOKEN_SKEW_MS = 60_000;
let cachedToken: { access_token: string; expires_at: number } | null = null;
let inFlight: Promise<SpotifyToken> | null = null;

export async function getAccessToken(): Promise<SpotifyToken> {
    if (cachedToken && Date.now() < cachedToken.expires_at - TOKEN_SKEW_MS) {
        return {
            access_token: cachedToken.access_token,
            token_type: "Bearer",
            expires_in: Math.floor((cachedToken.expires_at - Date.now()) / 1000),
        };
    }

    // Collapse concurrent refreshes into a single request.
    inFlight ??= (async () => {
        try {
            const response = await fetch(TOKEN_ENDPOINT, {
                method: "POST",
                headers: {
                    Authorization: `Basic ${basic}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "refresh_token",
                    refresh_token: refresh_token || "",
                }),
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error(`Spotify token refresh failed: ${response.status}`);
            }

            const token: SpotifyToken = await response.json();
            cachedToken = {
                access_token: token.access_token,
                expires_at: Date.now() + token.expires_in * 1000,
            };
            return token;
        } finally {
            inFlight = null;
        }
    })();

    return inFlight;
}

export async function getNowPlaying() {
    const { access_token } = await getAccessToken();

    // Use the player endpoint which includes device info
    const response = await fetch("https://api.spotify.com/v1/me/player", {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        cache: "no-store",
    });

    if (response.status === 204 || response.status > 400) {
        return null;
    }

    const data = await response.json();

    if (!data.item) {
        return null;
    }

    return {
        isPlaying: data.is_playing,
        title: data.item.name,
        artist: data.item.artists.map((artist: { name: string }) => artist.name).join(", "),
        album: data.item.album.name,
        albumImageUrl: data.item.album.images[0]?.url,
        songUrl: data.item.external_urls?.spotify,
        progress: data.progress_ms,
        duration: data.item.duration_ms,
        device: data.device?.name || null,
        deviceType: data.device?.type || null,
    };
}

export async function getPlaylist(playlistId: string) {
    const { access_token } = await getAccessToken();

    // First, get playlist info and first batch of tracks
    const response = await fetch(
        `${PLAYLIST_ENDPOINT}/${playlistId}?fields=name,tracks(total,items(track(name,artists(name),album(name,images),duration_ms,uri,external_urls)))`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
            next: { revalidate: 3600 },
        }
    );

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    let allTracks = data.tracks.items;
    const total = data.tracks.total;

    // Fetch remaining tracks if playlist has more than 100
    let offset = 100;
    while (offset < total) {
        const nextResponse = await fetch(
            `${PLAYLIST_ENDPOINT}/${playlistId}/tracks?offset=${offset}&limit=100&fields=items(track(name,artists(name),album(name,images),duration_ms,uri,external_urls))`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                next: { revalidate: 3600 },
            }
        );

        if (nextResponse.ok) {
            const nextData = await nextResponse.json();
            allTracks = [...allTracks, ...nextData.items];
        }
        offset += 100;
    }

    return {
        name: data.name,
        tracks: allTracks
            .filter((item: { track: SpotifyTrack | null }) => item.track !== null)
            .map((item: { track: SpotifyTrack }) => ({
                name: item.track.name,
                artist: item.track.artists.map((a) => a.name).join(", "),
                album: item.track.album.name,
                albumImageUrl: item.track.album.images[0]?.url,
                duration: item.track.duration_ms,
                spotifyUrl: item.track.external_urls.spotify,
                uri: item.track.uri,
            })),
    };
}
