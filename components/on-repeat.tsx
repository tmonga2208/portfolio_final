"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Track = { title: string; artist: string; albumImageUrl?: string; songUrl: string };

/**
 * Tarun's most-played tracks lately, from Spotify. Renders nothing until
 * Spotify shares them (the token needs the user-top-read scope).
 */
export function OnRepeat() {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/spotify/top-tracks")
      .then((res) => (res.ok ? res.json() : { tracks: [] }))
      .then((data: { tracks?: Track[] }) => {
        if (active) setTracks(data.tracks ?? []);
      })
      .catch(() => {
        // Offline or Spotify down: stay hidden.
      });
    return () => {
      active = false;
    };
  }, []);

  if (!tracks.length) return null;

  return (
    <aside className="mt-6 rounded-2xl border border-border p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-xs uppercase tracking-[0.25em] text-brand">On repeat</h3>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Lately, on Spotify</p>
      </div>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tracks.map((track) => (
          <li key={track.songUrl + track.title}>
            <a
              href={track.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 lg:flex-col lg:items-start"
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted lg:aspect-square lg:size-auto lg:w-full">
                {track.albumImageUrl && (
                  <Image
                    src={track.albumImageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 220px, 56px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </span>
              <span className="min-w-0 max-w-full">
                <span className="block truncate font-sans text-sm font-medium transition-colors group-hover:text-brand">
                  {track.title}
                </span>
                <span className="block truncate font-sans text-xs text-muted-foreground">{track.artist}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
