import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Story } from "@/lib/trips";
import { tripMonth, type Trip } from "@/types/travel";

/**
 * A trip's story, shared by its own page and the pop-over on the home page:
 * cover, title block, the story itself, and the trips either side of it.
 */
export function TripStory({ story, inOverlay = false }: { story: Story; inOverlay?: boolean }) {
  const { trip, content, earlier, later } = story;
  const facts = [tripMonth(trip.when), trip.with && `with ${trip.with}`].filter(Boolean).join(" · ");

  return (
    <article className="font-crimson">
      <div
        className={cn(
          "relative h-[42vh] min-h-[300px] w-full overflow-hidden md:h-[52vh]",
          !inOverlay && "rounded-[32px]"
        )}
      >
        <Image src={trip.cover} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-20 md:px-8">
        <header className="relative -mt-12">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{facts}</p>
          <h1 id="story-title" className="mt-3 text-5xl leading-[1.05] font-bold text-brand md:text-6xl">
            {trip.title}
          </h1>
          <p className="mt-4 text-2xl leading-snug text-muted-foreground italic">{trip.subtitle}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">{trip.location}</p>
        </header>

        {/* The story opens with a drop cap, like a magazine feature. */}
        <div className="mt-12 [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mt-1 [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:text-[4.6rem] [&>p:first-of-type]:first-letter:leading-[0.8] [&>p:first-of-type]:first-letter:font-bold [&>p:first-of-type]:first-letter:text-brand">
          {content}
        </div>

        {(earlier || later) && (
          <nav aria-label="More trips" className="mt-20 grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
            {earlier ? <TripLink trip={earlier} label="Earlier" inOverlay={inOverlay} /> : <span />}
            {later && <TripLink trip={later} label="Later" inOverlay={inOverlay} alignEnd />}
          </nav>
        )}
      </div>
    </article>
  );
}

function TripLink({
  trip,
  label,
  inOverlay,
  alignEnd = false,
}: {
  trip: Trip;
  label: string;
  inOverlay: boolean;
  alignEnd?: boolean;
}) {
  return (
    // In the pop-over, swap the story in place so Back still closes it.
    <Link href={`/travel/${trip.slug}`} replace={inOverlay} scroll={!inOverlay} className={cn("group block", alignEnd && "sm:text-right")}>
      <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {alignEnd ? `${label} →` : `← ${label}`}
      </span>
      <span className="mt-2 block text-2xl font-bold text-foreground italic transition-colors group-hover:text-brand">
        {trip.title}
      </span>
      <span className="mt-1 block text-sm text-muted-foreground">{tripMonth(trip.when)}</span>
    </Link>
  );
}
