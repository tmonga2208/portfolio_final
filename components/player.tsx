"use client"
import { ArrowUpRight, AudioLines, Link, ListMusic, Pause, Play, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface PlayerProps {
    imgurl: string;
    name: string;
    artist: string;
    mp3url: string;
    queue: Array<Omit<PlayerProps, 'queue'>>
}

export function Player({ imgurl, name, artist, mp3url, queue }: PlayerProps) {
    const [currentTrack, setCurrentTrack] = useState({ imgurl, name, artist, mp3url });
    const [isPlaying, setIsPlaying] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Update current track if props change (optional, but good practice)
    useEffect(() => {
        // Only update if we haven't started playing something else from the queue
        // Or strictly follow props. For now, let's respect the initial props and queue interactions.
        // If we want to strictly follow props updates from parent:
        // setCurrentTrack({ imgurl, name, artist, mp3url });
    }, [imgurl, name, artist, mp3url]);

    // Handle track changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed:", e));
            }
        }
    }, [currentTrack]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }

    const playFromQueue = (track: Omit<PlayerProps, 'queue'>) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    }

    return (
        <div>
            <audio ref={audioRef} onEnded={() => setIsPlaying(false)}>
                <source src={currentTrack.mp3url} type="audio/mp3" />
            </audio>

            {isVisible && (
                <div className="z-100 min-w-xs w-full max-w-lg mx-auto font-sans fixed bottom-4 left-1/2 -translate-x-1/2 group">
                    <div className={`relative z-20 bg-[#121212] text-white p-3 rounded-2xl flex items-center gap-4 shadow-2xl border border-white/5 transition-all duration-300 ${showQueue ? 'rounded-b-none' : ''}`}>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute -top-3 left-0 bg-[#121212] text-white/70 hover:text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg border border-white/10 z-50 hover:bg-white/10 hover:scale-110"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="relative shrink-0 group/cover cursor-pointer" onClick={togglePlay}>
                            <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 relative">
                                <img
                                    src={currentTrack.imgurl}
                                    alt={currentTrack.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover/cover:scale-110"
                                />
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover/cover:opacity-100' : 'opacity-100'}`}>
                                    {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-1" />}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                            <h3 className="font-bold text-base tracking-tight truncate leading-none mb-1">{currentTrack.name}</h3>
                            <p className="text-xs font-medium text-white/50 uppercase tracking-wider truncate">
                                {currentTrack.artist}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowQueue(!showQueue)}
                            className={`p-2 rounded-lg transition-colors hover:bg-white/10 ${showQueue ? 'bg-white/10 text-white' : 'text-white/40'}`}
                        >
                            <ListMusic className="w-5 h-5" />
                        </button>
                    </div>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#121212] border-x border-b border-white/5 rounded-b-2xl mx-1 shadow-xl ${showQueue ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-3 pt-4 space-y-2">
                            {queue.length > 0 ? (
                                queue.map((track, i) => (
                                    <div
                                        key={i}
                                        onClick={() => playFromQueue(track)}
                                        className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group/item ${currentTrack.name === track.name ? 'bg-white/10' : ''}`}
                                    >
                                        <img src={track.imgurl} alt={track.name} className="w-8 h-8 rounded-md object-cover opacity-60 group-hover/item:opacity-100 transition-opacity" />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate group-hover/item:text-white ${currentTrack.name === track.name ? 'text-white' : 'text-white/80'}`}>{track.name}</p>
                                            <p className="text-xs text-white/40 truncate">{track.artist}</p>
                                        </div>
                                        {currentTrack.name === track.name && isPlaying && (
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-xs text-white/30 py-4 uppercase tracking-widest">Queue Empty</p>
                            )}
                            {showQueue && (
                                <div className="flex items-center gap-2 p-2 rounded-lg text-white hover:bg-white/5 cursor-pointer justify-center">
                                    <a href="https://open.spotify.com/playlist/5zm54nM2Y2gEGS3VeWF3vY?si=84b9c6a37ece4f9e">More <ArrowUpRight /></a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {!isVisible && (
                <button
                    onClick={() => setIsVisible(true)}
                    className="fixed bottom-4 right-4 z-100 max-w-lg mx-auto font-sans bg-[#121212] text-white p-3 rounded-2xl shadow-2xl border border-white/5 transition-all duration-300"
                >
                    {isPlaying ? <AudioLines className="w-6 h-6 fill-white animate-music-pulse" /> : <AudioLines className="w-6 h-6 fill-white" />}
                </button>
            )}
        </div>
    )
}