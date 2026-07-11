"use client"
import { ArrowUpRight, AudioLines, ListMusic, Pause, Play, SkipBack, SkipForward, X, Volume2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
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

interface PlayerProps {
    imgurl: string;
    name: string;
    artist: string;
    mp3url: string;
}

declare global {
    interface Window {
        Spotify: typeof Spotify;
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

export function Player({ imgurl, name, artist, mp3url }: PlayerProps) {
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

    // Local MP3 playback
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isLocalPlaying, setIsLocalPlaying] = useState(false);
    const [localProgress, setLocalProgress] = useState(0);
    const [localDuration, setLocalDuration] = useState(0);

    // Initialize Spotify Web Playback SDK
    const initializePlayer = useCallback(async () => {
        try {
            const res = await fetch('/api/spotify/token');
            const { access_token } = await res.json();

            if (!access_token) {
                console.error('No access token available');
                return;
            }

            const spotifyPlayer = new window.Spotify.Player({
                name: 'Tarun\'s Portfolio Player',
                getOAuthToken: (cb: (token: string) => void) => {
                    cb(access_token);
                },
                volume: 0.5
            });

            // Error handling
            spotifyPlayer.addListener('initialization_error', ({ message }) => {
                console.error('Init Error:', message);
            });
            spotifyPlayer.addListener('authentication_error', ({ message }) => {
                console.error('Auth Error:', message);
            });
            spotifyPlayer.addListener('account_error', ({ message }) => {
                console.error('Account Error:', message);
            });

            // Ready
            spotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
                setIsPlayerReady(true);
            });

            // Not Ready
            spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
                setIsPlayerReady(false);
            });

            // Player state changed
            spotifyPlayer.addListener('player_state_changed', (state) => {
                if (!state) return;

                setCurrentTrack(state.track_window.current_track);
                setIsPaused(state.paused);
                setPosition(state.position);
                setDuration(state.duration);
            });

            spotifyPlayer.connect();
            setPlayer(spotifyPlayer);
        } catch (error) {
            console.error('Failed to initialize player:', error);
        }
    }, []);

    // Handle SDK ready
    useEffect(() => {
        window.onSpotifyWebPlaybackSDKReady = () => {
            initializePlayer();
        };

        // If SDK is already loaded
        if (window.Spotify) {
            initializePlayer();
        }
    }, [initializePlayer]);

    // Update position every second while playing
    useEffect(() => {
        if (!isPaused && position < duration) {
            const interval = setInterval(() => {
                setPosition(prev => Math.min(prev + 1000, duration));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isPaused, position, duration]);

    // Fetch now playing (for when playing on other devices)
    useEffect(() => {
        const fetchNowPlaying = async () => {
            try {
                const res = await fetch('/api/spotify/now-playing');
                const data = await res.json();
                setNowPlaying(data);
            } catch (error) {
                console.error('Error fetching now playing:', error);
            }
        };

        if (!currentTrack) {
            fetchNowPlaying();
            const interval = setInterval(fetchNowPlaying, 30000);
            return () => clearInterval(interval);
        }
    }, [currentTrack]);

    // Fetch playlist
    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                setIsLoading(true);
                const res = await fetch('/api/spotify/playlist');
                const data = await res.json();
                setPlaylist(data);
            } catch (error) {
                console.error('Error fetching playlist:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylist();
    }, []);

    // Play a track from playlist
    const playTrack = async (trackUri?: string, playlistUri?: string) => {
        if (!deviceId) return;

        // Stop local audio when playing Spotify
        if (audioRef.current && isLocalPlaying) {
            audioRef.current.pause();
            setIsLocalPlaying(false);
        }

        try {
            const tokenRes = await fetch('/api/spotify/token');
            const { access_token } = await tokenRes.json();

            const body: { context_uri?: string; uris?: string[]; offset?: { uri: string } } = {};

            if (playlistUri) {
                body.context_uri = playlistUri;
                if (trackUri) {
                    body.offset = { uri: trackUri };
                }
            } else if (trackUri) {
                body.uris = [trackUri];
            }

            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
        } catch (error) {
            console.error('Error playing track:', error);
        }
    };

    // Control functions
    const togglePlay = () => {
        player?.togglePlay();
    };

    const toggleLocalPlay = () => {
        if (audioRef.current) {
            if (isLocalPlaying) {
                audioRef.current.pause();
                setIsLocalPlaying(false);
            } else {
                // Stop Spotify when playing local
                if (player && !isPaused) {
                    player.pause();
                }
                audioRef.current.play();
                setIsLocalPlaying(true);
            }
        }
    };

    const skipNext = () => {
        player?.nextTrack();
    };

    const skipPrev = () => {
        player?.previousTrack();
    };

    // Calculate progress percentage
    const progressPercent = currentTrack
        ? (duration > 0 ? (position / duration) * 100 : 0)
        : isLocalPlaying
            ? (localDuration > 0 ? (localProgress / localDuration) * 100 : 0)
            : (nowPlaying?.duration && nowPlaying?.progress)
                ? (nowPlaying.progress / nowPlaying.duration) * 100
                : 0;

    // Current display track
    const displayTrack = currentTrack
        ? {
            imgurl: currentTrack.album.images[0]?.url || imgurl,
            name: currentTrack.name,
            artist: currentTrack.artists.map(a => a.name).join(', '),
            isSpotify: true,
            isPlaying: !isPaused,
            device: "Tarun's Portfolio",
            isLocal: false,
        }
        : nowPlaying?.isPlaying && nowPlaying.title
            ? {
                imgurl: nowPlaying.albumImageUrl || imgurl,
                name: nowPlaying.title,
                artist: nowPlaying.artist || artist,
                isSpotify: true,
                isPlaying: true,
                device: nowPlaying.device || 'Spotify',
                isLocal: false,
            }
            : {
                imgurl,
                name,
                artist,
                isSpotify: false,
                isPlaying: isLocalPlaying,
                device: null,
                isLocal: true,
            };

    return (
        <div>
            {/* Local MP3 audio element */}
            <audio
                ref={audioRef}
                src={mp3url}
                onTimeUpdate={(e) => setLocalProgress(e.currentTarget.currentTime * 1000)}
                onLoadedMetadata={(e) => setLocalDuration(e.currentTarget.duration * 1000)}
                onEnded={() => setIsLocalPlaying(false)}
            />

            <Script
                src="https://sdk.scdn.co/spotify-player.js"
                strategy="afterInteractive"
            />

            {isVisible && (
                <div className="z-100 min-w-xs w-full max-w-lg mx-auto font-sans fixed bottom-4 left-1/2 -translate-x-1/2 group">
                    <div className={`relative z-20 bg-[#121212] text-white p-3 rounded-2xl flex items-center gap-4 shadow-2xl border border-white/5 transition-all duration-300 ${showQueue ? 'rounded-b-none' : ''}`}>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute -top-3 left-0 bg-[#121212] text-white/70 hover:text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg border border-white/10 z-50 hover:bg-white/10 hover:scale-110"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Album Art with Progress Ring */}
                        <div
                            className="relative shrink-0 cursor-pointer group/cover"
                            onClick={() => {
                                if (displayTrack.isLocal) {
                                    toggleLocalPlay();
                                }
                            }}
                        >
                            <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 relative">
                                <img
                                    src={displayTrack.imgurl}
                                    alt={displayTrack.name}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover/cover:scale-110"
                                />
                                {displayTrack.isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <AudioLines className="w-5 h-5 text-green-500 animate-pulse" />
                                    </div>
                                )}
                                {displayTrack.isLocal && !displayTrack.isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity">
                                        <Play className="w-6 h-6 text-white ml-0.5" />
                                    </div>
                                )}
                            </div>
                            {/* Progress bar */}
                            {(displayTrack.isSpotify || displayTrack.isLocal) && (
                                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-300"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                            {displayTrack.isSpotify && (
                                <p className="text-[10px] uppercase tracking-widest text-green-500 font-medium">
                                    🎧 Playing on {displayTrack.device}
                                </p>
                            )}
                            {displayTrack.isLocal && isLocalPlaying && (
                                <p className="text-[10px] uppercase tracking-widest text-green-500 font-medium">
                                    🎵 Tarun's Pick
                                </p>
                            )}
                            {displayTrack.isLocal && !isLocalPlaying && (
                                <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
                                    Click to play
                                </p>
                            )}
                            <h3 className="font-bold text-base tracking-tight truncate leading-none mb-1">{displayTrack.name}</h3>
                            <p className="text-xs font-medium text-white/50 uppercase tracking-wider truncate">
                                {displayTrack.artist}
                            </p>
                        </div>

                        {/* Local Playback Controls */}
                        {displayTrack.isLocal && (
                            <button
                                onClick={toggleLocalPlay}
                                className="p-2 rounded-full bg-white text-black hover:scale-105 transition-transform"
                            >
                                {isLocalPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                        )}

                        {/* Spotify Playback Controls */}
                        {isPlayerReady && !displayTrack.isLocal && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={skipPrev}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                >
                                    <SkipBack className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={togglePlay}
                                    className="p-2 rounded-full bg-white text-black hover:scale-105 transition-transform"
                                >
                                    {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={skipNext}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                >
                                    <SkipForward className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setShowQueue(!showQueue)}
                            className={`p-2 rounded-lg transition-colors hover:bg-white/10 ${showQueue ? 'bg-white/10 text-white' : 'text-white/40'}`}
                        >
                            <ListMusic className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Queue / Playlist Dropdown */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#121212] border-x border-b border-white/5 rounded-b-2xl mx-1 shadow-xl ${showQueue ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
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
                                    {playlist.tracks.map((track, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                if (isPlayerReady && track.uri) {
                                                    playTrack(track.uri, `spotify:playlist:${process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID || '5zm54nM2Y2gEGS3VeWF3vY'}`);
                                                } else if (track.spotifyUrl) {
                                                    window.open(track.spotifyUrl, '_blank');
                                                }
                                            }}
                                            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group/item ${currentTrack?.name === track.name ? 'bg-white/10' : ''}`}
                                        >
                                            <img src={track.albumImageUrl} alt={track.name} className="w-10 h-10 rounded-md object-cover opacity-60 group-hover/item:opacity-100 transition-opacity" />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate group-hover/item:text-white ${currentTrack?.name === track.name ? 'text-green-400' : 'text-white/80'}`}>{track.name}</p>
                                                <p className="text-xs text-white/40 truncate">{track.artist}</p>
                                            </div>
                                            {currentTrack?.name === track.name && !isPaused && (
                                                <div className="flex items-center gap-0.5">
                                                    <div className="w-0.5 h-3 bg-green-500 animate-pulse" />
                                                    <div className="w-0.5 h-4 bg-green-500 animate-pulse delay-75" />
                                                    <div className="w-0.5 h-2 bg-green-500 animate-pulse delay-150" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <p className="text-center text-xs text-white/30 py-4 uppercase tracking-widest">No tracks available</p>
                            )}
                            <div className="flex items-center gap-2 p-2 rounded-lg text-white hover:bg-white/5 cursor-pointer justify-center border-t border-white/5 mt-2 pt-3">
                                <a
                                    href="https://open.spotify.com/playlist/5zm54nM2Y2gEGS3VeWF3vY"
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
                    onClick={() => setIsVisible(true)}
                    className="fixed bottom-4 right-4 z-100 max-w-lg mx-auto font-sans bg-[#121212] text-white p-3 rounded-2xl shadow-2xl border border-white/5 transition-all duration-300"
                >
                    {displayTrack.isPlaying ? (
                        <AudioLines className="w-6 h-6 text-green-500 animate-pulse" />
                    ) : (
                        <AudioLines className="w-6 h-6 fill-white" />
                    )}
                </button>
            )}
        </div>
    )
}