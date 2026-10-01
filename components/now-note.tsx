"use client";

import Link from "next/link";
import { BookOpen, Headphones, MapPin, Mountain, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useNowPlaying } from "@/components/now-playing";
import { books } from "@/types/library";

/** Bump this whenever the lines below change. */
const UPDATED = "October 2026";

function Line({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <Icon aria-hidden className="mt-1.5 size-4 shrink-0 text-brand" />
      <span>{children}</span>
    </li>
  );
}

/**
 * A "now" page in miniature: what Tarun is up to this month. The book comes
 * from the library (whatever is marked "reading"); the song is live from Spotify.
 */
export function NowNote() {
  const playing = useNowPlaying();
  const reading = books.find((book) => book.status === "reading");

  return (
    <aside className="mt-16 rounded-2xl border border-border p-6 md:mt-20 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-xs uppercase tracking-[0.25em] text-brand">Now</h3>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Updated {UPDATED}</p>
      </div>
      <ul className="mt-6 grid gap-x-12 gap-y-5 text-lg leading-snug md:grid-cols-2">
        <Line icon={MapPin}>
          Working <em>client-side</em> in Pune: the on-site kind. (Fine, the JavaScript kind too.)
        </Line>
        <Line icon={Mountain}>
          Hunting for a new trek every weekend. My knees have started filing complaints.
        </Line>
        {reading && (
          <Line icon={BookOpen}>
            Reading{" "}
            <Link href="/library" className="link-underline italic text-brand">
              {reading.title}
            </Link>
            , so my savings can stop just sitting there looking cute.
          </Line>
        )}
        <Line icon={Headphones}>
          Songs on loop, daydreaming in between.{" "}
          {playing?.isPlaying && playing.title ? (
            <span className="text-muted-foreground">
              Right now: <span className="text-foreground">{playing.title}</span>
              {playing.artist && <> by {playing.artist}</>}.
            </span>
          ) : (
            <span className="text-muted-foreground">Right now: silence. Suspicious.</span>
          )}
        </Line>
      </ul>
    </aside>
  );
}
