"use client";

import { useEffect, useState } from "react";

type NowPlaying = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  songUrl?: string;
};

const POLL_MS = 60_000;

/** Equalizer bars that bounce while music is playing. */
function Equalizer() {
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[0, 0.2, 0.4, 0.1].map((delay) => (
        <span
          key={delay}
          className="w-[3px] origin-bottom rounded-sm bg-brand animate-equalizer"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

/**
 * A one-line "currently listening to" for the footer, straight from Tarun's
 * Spotify. Shows nothing when nothing is playing, rather than a stale track.
 */
export function NowPlayingBadge() {
  const [data, setData] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/spotify/now-playing");
        if (!res.ok) return;
        const json: NowPlaying = await res.json();
        if (active) setData(json);
      } catch {
        // Offline or Spotify down — the footer just stays quiet.
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!data?.isPlaying || !data.title) return null;

  return (
    <a
      href={data.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-text="Open in Spotify"
      className="flex min-w-0 items-center gap-3 normal-case tracking-normal transition-colors hover:text-brand"
    >
      <Equalizer />
      <span className="truncate">
        <span className="uppercase tracking-[0.2em]">Listening to </span>
        <span className="font-semibold text-foreground">{data.title}</span>
        {data.artist && <span> — {data.artist}</span>}
      </span>
    </a>
  );
}
