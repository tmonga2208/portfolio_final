"use client";

import Image from "next/image";
import CursorFollow from "@/components/smoothui/cursor-follow";
import { cn } from "@/lib/utils";

type Photo = {
  src: string;
  width: number;
  height: number;
  /** One-liner shown in the cursor tooltip on hover. */
  caption?: string;
};

const TOP_ROW: Photo[] = [
  { src: "/gallery/g01.jpg", width: 1050, height: 1400, caption: "Fun with friends" },
  { src: "/gallery/g02.jpg", width: 933, height: 1400, caption: "Happy haldi, Di" },
  { src: "/gallery/g03.jpg", width: 1037, height: 1400, caption: "" },
  { src: "/gallery/g04.jpg", width: 1050, height: 1400, caption: "Rakhi with my sisters" },
  { src: "/gallery/g05.jpg", width: 1050, height: 1400, caption: "Harishchandragad — birthday trip 2026" },
  { src: "/gallery/g06.jpg", width: 1050, height: 1400, caption: "" },
];

const BOTTOM_ROW: Photo[] = [
  { src: "/gallery/g07.jpg", width: 933, height: 1400, caption: "Happy wedding, Di" },
  { src: "/gallery/g08.jpg", width: 1400, height: 1050, caption: "Cute moments with my Dis" },
  { src: "/gallery/g09.jpg", width: 1400, height: 787, caption: "" },
  { src: "/gallery/g10.jpg", width: 1400, height: 960, caption: "Mom & Dad's 25th anniversary" },
  { src: "/gallery/g11.jpg", width: 1400, height: 1049, caption: "Best trip memory" },
];

function MarqueeRow({ photos, reverse = false }: { photos: Photo[]; reverse?: boolean }) {
  return (
    // The track holds the photos twice and slides by exactly half its width,
    // so the loop point is invisible.
    <div className="group/row overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div
        className={cn(
          "flex w-max group-hover/row:[animation-play-state:paused]",
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        )}
      >
        {[...photos, ...photos].map((photo, i) => (
          <div
            key={i}
            aria-hidden={i >= photos.length}
            data-cursor-text={photo.caption || undefined}
            className="relative mr-4 h-56 shrink-0 overflow-hidden rounded-lg md:mr-6 md:h-72"
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
          >
            <Image
              src={photo.src}
              alt={photo.caption || ""}
              fill
              sizes="(min-width: 768px) 400px, 300px"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GalleryMarquee() {
  return (
    <CursorFollow className="z-auto">
      <div className="flex flex-col gap-8 md:gap-10">
        <MarqueeRow photos={TOP_ROW} />
        <div className="h-px bg-border" />
        <MarqueeRow photos={BOTTOM_ROW} reverse />
      </div>
    </CursorFollow>
  );
}
