"use client"
import { ArrowUpRight, AudioLines, ListMusic, Music, Pause, Play, SkipBack, SkipForward, Volume1, Volume2, VolumeX, X } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Script from "next/script";

interface SpotifyTrack {
    name: string;
    artist: string;
    albumImageUrl: string;
    spotifyUrl?: string;
    uri?: string;
}

interface NowPlayingData {
    isPlaying: boolean;
    title?: string;
    artist?: string;
    album?: string;
    albumImageUrl?: string;
    songUrl?: string;
    progress?: number;
    duration?: number;
    device?: string;
    deviceType?: string;
}

interface PlaylistData {
    name: string;
    tracks: SpotifyTrack[];
}

declare global {
    interface Window {
        Spotify: typeof Spotify;
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

const PLAYLIST_ID = process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID || "5zm54nM2Y2gEGS3VeWF3vY";
const HIDDEN_KEY = "player:hidden";
const VOLUME_KEY = "player:volume";

// Rewinding past this point in a track restarts it instead of stepping back,
// which is what every other player does.
const RESTART_THRESHOLD_MS = 3000;

function formatTime(ms: number): string {
    if (!ms || !Number.isFinite(ms) || ms < 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Hold the token for its real lifetime instead of re-fetching on every play,
// so a visitor clicking through the queue doesn't hammer the token route.
let tokenCache: { value: string; expiresAt: number } | null = null;
let tokenInFlight: Promise<string | null> | null = null;

async function fetchAccessToken(): Promise<string | null> {
    if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
        return tokenCache.value;
    }

    tokenInFlight ??= (async () => {
        try {
            const res = await fetch("/api/spotify/token");
            if (!res.ok) return null;
            const { access_token, expires_in } = await res.json();
            if (!access_token) return null;
            tokenCache = {
                value: access_token,
                expiresAt: Date.now() + (expires_in ?? 3600) * 1000,
            };
            return access_token;
        } catch {
            return null;
        } finally {
            tokenInFlight = null;
        }
    })();

    return tokenInFlight;
}

export function Player() {
    const [mounted, setMounted] = useState(false);
    const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const [showQueue, setShowQueue] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const [player, setPlayer] = useState<Spotify.Player | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [currentTrack, setCurrentTrack] = useState<Spotify.Track | null>(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    const [remotePosition, setRemotePosition] = useState(0);

    const [volume, setVolume] = useState(0.5);
    const volumeRef = useRef(0.5);
    const lastVolumeRef = useRef(0.5);

    const [scrubMs, setScrubMs] = useState<number | null>(null);
    const isScrubbingRef = useRef(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Spotify reports position only when state changes, so anchor to a timestamp
    // and interpolate between updates rather than blindly incrementing.
    const sdkAnchorRef = useRef({ position: 0, at: 0 });
    const remoteAnchorRef = useRef({ position: 0, at: 0 });

    // "sdk"    — playing through the Web Playback SDK in this browser
    // "remote" — playing (or paused) on one of Tarun's other devices
    // "idle"   — Spotify has nothing to report
    const mode: "sdk" | "remote" | "idle" = currentTrack
        ? "sdk"
        : nowPlaying?.title
            ? "remote"
            : "idle";

    // Restore persisted preferences before the first paint of the player itself.
    useEffect(() => {
        try {
            if (localStorage.getItem(HIDDEN_KEY) === "1") setIsVisible(false);
            const saved = localStorage.getItem(VOLUME_KEY);
            if (saved !== null) {
                const parsed = Number(saved);
                if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
                    setVolume(parsed);
                    volumeRef.current = parsed;
                    lastVolumeRef.current = parsed || 0.5;
                }
            }
        } catch {
            // Private mode / storage disabled — defaults are fine.
        }
        setMounted(true);
    }, []);

    const createPlayer = useCallback(async (): Promise<Spotify.Player | null> => {
        const token = await fetchAccessToken();
        if (!token) {
            console.error("No access token available");
            return null;
        }

        const spotifyPlayer = new window.Spotify.Player({
            name: "Tarun's Portfolio Player",
            // The SDK calls this again when the token expires, so it has to go
            // back to the server rather than close over the original token.
            getOAuthToken: (cb: (token: string) => void) => {
                fetchAccessToken().then((fresh) => {
                    if (fresh) cb(fresh);
                });
            },
            volume: volumeRef.current,
        });

        spotifyPlayer.addListener("initialization_error", ({ message }) => {
            console.error("Init Error:", message);
        });
        spotifyPlayer.addListener("authentication_error", ({ message }) => {
            console.error("Auth Error:", message);
        });
        spotifyPlayer.addListener("account_error", ({ message }) => {
            console.error("Account Error:", message);
        });

        spotifyPlayer.addListener("ready", ({ device_id }) => {
            setDeviceId(device_id);
            setIsPlayerReady(true);
        });

        spotifyPlayer.addListener("not_ready", () => {
            setIsPlayerReady(false);
        });

        spotifyPlayer.addListener("player_state_changed", (state) => {
            if (!state) return;
            setCurrentTrack(state.track_window.current_track);
            setIsPaused(state.paused);
            setDuration(state.duration);
            setPosition(state.position);
            sdkAnchorRef.current = { position: state.position, at: performance.now() };
        });

        return spotifyPlayer;
    }, []);

    // Initialize the SDK, and tear it down on unmount so we don't leak a player
    // (or register a duplicate device under StrictMode's double-mount).
    useEffect(() => {
        let cancelled = false;
        let created: Spotify.Player | null = null;

        const setup = async () => {
            const instance = await createPlayer();
            if (!instance) return;
            if (cancelled) {
                instance.disconnect();
                return;
            }
            created = instance;
            instance.connect();
            setPlayer(instance);
        };

        if (window.Spotify) {
            setup();
        } else {
            window.onSpotifyWebPlaybackSDKReady = setup;
        }

        return () => {
            cancelled = true;
            created?.disconnect();
            setPlayer(null);
            setIsPlayerReady(false);
            setDeviceId(null);
        };
    }, [createPlayer]);

    // Interpolate SDK playback position between state-change events.
    useEffect(() => {
        if (mode !== "sdk" || isPaused || duration <= 0) return;

        const tick = () => {
            const { position: base, at } = sdkAnchorRef.current;
            setPosition(Math.min(base + (performance.now() - at), duration));
        };

        const interval = setInterval(tick, 500);
        return () => clearInterval(interval);
    }, [mode, isPaused, duration]);

    // Same idea for a track playing on another device, where we only learn the
    // real position once every poll.
    useEffect(() => {
        if (mode !== "remote" || !nowPlaying?.isPlaying) return;
        const total = nowPlaying.duration ?? 0;
        if (total <= 0) return;

        const tick = () => {
            const { position: base, at } = remoteAnchorRef.current;
            setRemotePosition(Math.min(base + (performance.now() - at), total));
        };

        const interval = setInterval(tick, 500);
        return () => clearInterval(interval);
    }, [mode, nowPlaying?.isPlaying, nowPlaying?.duration]);

    // Poll what Spotify is doing elsewhere, unless we're driving playback here.
    useEffect(() => {
        if (currentTrack) return;

        let active = true;

        const fetchNowPlaying = async () => {
            try {
                const res = await fetch("/api/spotify/now-playing");
                const data: NowPlayingData = await res.json();
                if (!active) return;
                setNowPlaying(data);
                remoteAnchorRef.current = { position: data.progress ?? 0, at: performance.now() };
                setRemotePosition(data.progress ?? 0);
            } catch (error) {
                console.error("Error fetching now playing:", error);
            }
        };

        fetchNowPlaying();
        const interval = setInterval(fetchNowPlaying, 30000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [currentTrack]);

    // Fetch playlist
    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/spotify/playlist");
                if (!res.ok) throw new Error(`Playlist request failed: ${res.status}`);
                const data = await res.json();
                setPlaylist(data);
            } catch (error) {
                console.error("Error fetching playlist:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylist();
    }, []);

    // Keep the SDK at the chosen volume and remember it across visits.
    useEffect(() => {
        volumeRef.current = volume;
        player?.setVolume(volume);
        if (!mounted) return;
        try {
            localStorage.setItem(VOLUME_KEY, String(volume));
        } catch {
            // Ignore storage failures.
        }
    }, [volume, player, mounted]);

    // Close the queue on Escape or an outside click.
    useEffect(() => {
        if (!showQueue) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowQueue(false);
        };
        const onPointerDown = (e: PointerEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setShowQueue(false);
        };

        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("pointerdown", onPointerDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("pointerdown", onPointerDown);
        };
    }, [showQueue]);

    const playTrack = async (trackUri?: string, playlistUri?: string) => {
        if (!deviceId) return;

        try {
            const token = await fetchAccessToken();
            if (!token) return;

            const body: { context_uri?: string; uris?: string[]; offset?: { uri: string } } = {};

            if (playlistUri) {
                body.context_uri = playlistUri;
                if (trackUri) body.offset = { uri: trackUri };
            } else if (trackUri) {
                body.uris = [trackUri];
            }

            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error("Error playing track:", error);
        }
    };

    const togglePlay = () => {
        player?.togglePlay();
    };

    const skipNext = () => {
        player?.nextTrack();
    };

    const skipPrev = () => {
        if (!player) return;
        if (position > RESTART_THRESHOLD_MS) {
            player.seek(0);
            sdkAnchorRef.current = { position: 0, at: performance.now() };
            setPosition(0);
            return;
        }
        player.previousTrack();
    };

    const progressMs = mode === "sdk" ? position : mode === "remote" ? remotePosition : 0;
    const durationMs = mode === "sdk" ? duration : mode === "remote" ? nowPlaying?.duration ?? 0 : 0;

    // Only the browser player is ours to scrub; a track on someone else's
    // speaker is display-only here.
    const canSeek = mode === "sdk" && durationMs > 0;
    const displayMs = scrubMs ?? progressMs;
    const progressPercent = durationMs > 0 ? Math.min((displayMs / durationMs) * 100, 100) : 0;

    const commitSeek = (value: number) => {
        if (mode !== "sdk") return;
        player?.seek(value);
        sdkAnchorRef.current = { position: value, at: performance.now() };
        setPosition(value);
    };

    const isMuted = volume === 0;
    const toggleMute = () => {
        if (isMuted) {
            setVolume(lastVolumeRef.current || 0.5);
        } else {
            lastVolumeRef.current = volume;
            setVolume(0);
        }
    };
    const VolumeIcon = isMuted ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

    const hidePlayer = () => {
        setIsVisible(false);
        setShowQueue(false);
        try {
            localStorage.setItem(HIDDEN_KEY, "1");
        } catch {
            // Ignore storage failures.
        }
    };

    const showPlayer = () => {
        setIsVisible(true);
        try {
            localStorage.removeItem(HIDDEN_KEY);
        } catch {
            // Ignore storage failures.
        }
    };

    const isPlaying = mode === "sdk" ? !isPaused : mode === "remote" ? Boolean(nowPlaying?.isPlaying) : false;

    const displayTrack =
        mode === "sdk" && currentTrack
            ? {
                imgurl: currentTrack.album.images[0]?.url ?? null,
                name: currentTrack.name,
                artist: currentTrack.artists.map((a) => a.name).join(", "),
                device: "Tarun's Portfolio",
            }
            : mode === "remote" && nowPlaying
                ? {
                    imgurl: nowPlaying.albumImageUrl ?? null,
                    name: nowPlaying.title ?? "",
                    artist: nowPlaying.artist ?? "",
                    device: nowPlaying.device || "Spotify",
                }
                : null;

    // The visibility preference lives in localStorage, so render nothing until
    // we've read it — otherwise a dismissed player flashes in on every load.
    if (!mounted) return null;

    return (
        <div>
            <Script src="https://sdk.scdn.co/spotify-player.js" strategy="afterInteractive" />

            {isVisible && (
                <div
                    ref={containerRef}
                    className="z-100 w-full max-w-lg px-3 sm:px-0 mx-auto font-sans fixed bottom-4 left-1/2 -translate-x-1/2 group"
                >
                    <div
                        className={`relative z-20 bg-[#121212] text-white p-3 rounded-2xl shadow-2xl border border-white/5 transition-all duration-300 ${showQueue ? "rounded-b-none" : ""}`}
                    >
                        <button
                            onClick={hidePlayer}
                            aria-label="Hide player"
                            className="absolute -top-3 left-0 bg-[#121212] text-white/70 hover:text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 shadow-lg border border-white/10 z-50 hover:bg-white/10 hover:scale-110"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-4">
                            {/* Album art, or an empty frame when Spotify has nothing to show */}
                            <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-white/10">
                                {displayTrack?.imgurl ? (
                                    <>
                                        <Image
                                            src={displayTrack.imgurl}
                                            alt={displayTrack.name}
                                            fill
                                            sizes="56px"
                                            className="object-cover"
                                        />
                                        {isPlaying && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <AudioLines className="w-5 h-5 text-green-500 motion-safe:animate-pulse" />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Music className="w-5 h-5 text-white/25" />
                                    </div>
                                )}
                            </div>

                            {/* Track info, or the idle placeholder */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 text-left">
                                {displayTrack ? (
                                    <>
                                        <p
                                            className={`text-[10px] uppercase tracking-widest font-medium truncate ${isPlaying ? "text-green-500" : "text-white/40"}`}
                                        >
                                            {isPlaying ? `🎧 Playing on ${displayTrack.device}` : "Paused"}
                                        </p>
                                        <h3 className="font-bold text-base tracking-tight truncate leading-none mb-1">
                                            {displayTrack.name}
                                        </h3>
                                        <p className="text-xs font-medium text-white/50 uppercase tracking-wider truncate">
                                            {displayTrack.artist}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                                            Spotify
                                        </p>
                                        <h3 className="font-bold text-base tracking-tight truncate leading-none mb-1 text-white/70">
                                            Nothing playing
                                        </h3>
                                        <p className="text-xs font-medium text-white/40 uppercase tracking-wider truncate">
                                            Browse the playlist
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Transport — only ours to drive when the SDK owns playback */}
                            {isPlayerReady && mode === "sdk" && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={skipPrev}
                                        aria-label="Previous track"
                                        className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                    >
                                        <SkipBack className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={togglePlay}
                                        aria-label={isPaused ? "Play" : "Pause"}
                                        className="p-2 rounded-full bg-white text-black hover:scale-105 transition-transform"
                                    >
                                        {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={skipNext}
                                        aria-label="Next track"
                                        className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                    >
                                        <SkipForward className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Volume only affects the in-browser player */}
                            {mode === "sdk" && (
                                <div className="hidden sm:flex items-center gap-1.5 group/vol">
                                    <button
                                        onClick={toggleMute}
                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <VolumeIcon className="w-4 h-4" />
                                    </button>
                                    <div className="relative h-1 w-0 group-hover/vol:w-16 focus-within:w-16 transition-[width] duration-300 rounded-full bg-white/15 overflow-hidden group-hover/vol:overflow-visible">
                                        <div
                                            className="absolute inset-y-0 left-0 rounded-full bg-white/70"
                                            style={{ width: `${volume * 100}%` }}
                                        />
                                        <input
                                            type="range"
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={volume}
                                            onChange={(e) => setVolume(Number(e.target.value))}
                                            aria-label="Volume"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowQueue(!showQueue)}
                                aria-label="Toggle queue"
                                aria-expanded={showQueue}
                                className={`p-2 rounded-lg transition-colors hover:bg-white/10 ${showQueue ? "bg-white/10 text-white" : "text-white/40"}`}
                            >
                                <ListMusic className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Seek bar — revealed on hover, and only when there's a track to seek
                            through. The 0fr/1fr grid row is what lets the collapse animate;
                            touch devices have no hover, so it stays open there. */}
                        {displayTrack && (
                            <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 group-hover:grid-rows-[1fr] group-hover:opacity-100 focus-within:grid-rows-[1fr] focus-within:opacity-100 pointer-coarse:grid-rows-[1fr] pointer-coarse:opacity-100">
                                <div className="overflow-hidden">
                                    <div className="flex items-center gap-2 mt-2.5 px-0.5">
                                        <span className="text-[10px] tabular-nums text-white/40 w-8 text-right shrink-0">
                                            {formatTime(displayMs)}
                                        </span>
                                        <div className="relative h-1 flex-1 rounded-full bg-white/15 group/seek">
                                            <div
                                                className="absolute inset-y-0 left-0 rounded-full bg-green-500"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                            {canSeek && (
                                                <div
                                                    className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow opacity-0 group-hover/seek:opacity-100 group-focus-within/seek:opacity-100 transition-opacity"
                                                    style={{ left: `${progressPercent}%` }}
                                                />
                                            )}
                                            <input
                                                type="range"
                                                min={0}
                                                max={durationMs || 1}
                                                step={1000}
                                                value={displayMs}
                                                disabled={!canSeek}
                                                aria-label="Seek"
                                                aria-valuetext={`${formatTime(displayMs)} of ${formatTime(durationMs)}`}
                                                onPointerDown={() => {
                                                    isScrubbingRef.current = true;
                                                }}
                                                onChange={(e) => {
                                                    const value = Number(e.target.value);
                                                    // Keyboard input never fires pointerdown, so commit it right away.
                                                    if (isScrubbingRef.current) setScrubMs(value);
                                                    else commitSeek(value);
                                                }}
                                                onPointerUp={() => {
                                                    isScrubbingRef.current = false;
                                                    if (scrubMs !== null) commitSeek(scrubMs);
                                                    setScrubMs(null);
                                                }}
                                                onPointerCancel={() => {
                                                    isScrubbingRef.current = false;
                                                    setScrubMs(null);
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
                                            />
                                        </div>
                                        <span className="text-[10px] tabular-nums text-white/40 w-8 shrink-0">
                                            {formatTime(durationMs)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Queue / Playlist Dropdown */}
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#121212] border-x border-b border-white/5 rounded-b-2xl mx-1 shadow-xl ${showQueue ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                        <div className="p-3 pt-4 space-y-2 max-h-72 overflow-y-auto">
                            {!isPlayerReady && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-3">
                                    <p className="text-xs text-yellow-400">
                                        ⚠️ Spotify Premium required to play in browser. Click a track to open in Spotify app.
                                    </p>
                                </div>
                            )}
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                </div>
                            ) : playlist?.tracks && playlist.tracks.length > 0 ? (
                                <>
                                    <p className="text-xs text-white/40 uppercase tracking-widest px-2 pb-1">
                                        {playlist.name}
                                    </p>
                                    {playlist.tracks.map((track, i) => {
                                        const isCurrent = Boolean(track.uri) && currentTrack?.uri === track.uri;
                                        return (
                                            <button
                                                key={track.uri ?? i}
                                                type="button"
                                                onClick={() => {
                                                    if (isPlayerReady && track.uri) {
                                                        playTrack(track.uri, `spotify:playlist:${PLAYLIST_ID}`);
                                                    } else if (track.spotifyUrl) {
                                                        window.open(track.spotifyUrl, "_blank", "noopener,noreferrer");
                                                    }
                                                }}
                                                aria-current={isCurrent}
                                                className={`w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group/item ${isCurrent ? "bg-white/10" : ""}`}
                                            >
                                                <Image
                                                    src={track.albumImageUrl}
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                    className="w-10 h-10 rounded-md object-cover opacity-60 group-hover/item:opacity-100 transition-opacity"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`text-sm font-medium truncate group-hover/item:text-white ${isCurrent ? "text-green-400" : "text-white/80"}`}
                                                    >
                                                        {track.name}
                                                    </p>
                                                    <p className="text-xs text-white/40 truncate">{track.artist}</p>
                                                </div>
                                                {isCurrent && !isPaused && (
                                                    <div className="flex items-center gap-0.5">
                                                        <div className="w-0.5 h-3 bg-green-500 motion-safe:animate-pulse" />
                                                        <div className="w-0.5 h-4 bg-green-500 motion-safe:animate-pulse delay-75" />
                                                        <div className="w-0.5 h-2 bg-green-500 motion-safe:animate-pulse delay-150" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </>
                            ) : (
                                <p className="text-center text-xs text-white/30 py-4 uppercase tracking-widest">
                                    No tracks available
                                </p>
                            )}
                            <div className="flex items-center gap-2 p-2 rounded-lg text-white hover:bg-white/5 cursor-pointer justify-center border-t border-white/5 mt-2 pt-3">
                                <a
                                    href={`https://open.spotify.com/playlist/${PLAYLIST_ID}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-sm text-white/60 hover:text-white"
                                >
                                    Open in Spotify <ArrowUpRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isVisible && (
                <button
                    onClick={showPlayer}
                    aria-label="Show player"
                    className="fixed bottom-4 right-4 z-100 font-sans bg-[#121212] text-white p-3 rounded-2xl shadow-2xl border border-white/5 transition-all duration-300 hover:bg-white/10"
                >
                    {isPlaying ? (
                        <AudioLines className="w-6 h-6 text-green-500 motion-safe:animate-pulse" />
                    ) : (
                        <AudioLines className="w-6 h-6 text-white/50" />
                    )}
                </button>
            )}
        </div>
    );
}
