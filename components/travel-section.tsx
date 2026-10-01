"use client";

import { useState } from "react";
import { blogData } from "@/types/blog";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { TravelMap } from "@/components/travel-map";
import { TravelPolaroid } from "@/components/travel-polaroid";
import { SOMEDAY } from "@/types/places";

/**
 * The map and the photo piles are two views of the same trips: hovering a pin
 * fans out its pile, hovering a pile lights up its pin, and clicking either
 * opens the story.
 */
export function TravelSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mt-14 grid items-start gap-16 lg:grid-cols-[minmax(240px,380px)_1fr] lg:gap-20">
      <div className="mx-auto w-full max-w-[380px] lg:sticky lg:top-28">
        <TravelMap trips={blogData} activeId={hoveredId} onHover={setHoveredId} onSelect={setOpenId} />
        <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Hover a pin · click to open
        </p>

        <dl className="mt-8 text-lg">
          <div>
            <dt className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Someday</dt>
            {/* Hollow pins: places not visited yet. */}
            <dd className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
              {SOMEDAY.map((place) => (
                <span key={place} className="inline-flex items-center gap-2">
                  <span aria-hidden className="size-2.5 rounded-full border-2 border-brand" />
                  {place}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      {/* Inset so the hover fan-out never clips at the viewport edge. */}
      <RevealGroup className="flex flex-wrap justify-center gap-x-24 gap-y-16 px-6 md:px-16 lg:justify-start">
        {blogData.map((blog) => (
          <RevealItem key={blog.id}>
            <TravelPolaroid
              blog={blog}
              highlighted={hoveredId === blog.id}
              onHoverChange={(hovered) => setHoveredId(hovered ? blog.id : null)}
              open={openId === blog.id}
              onOpenChange={(open) => setOpenId(open ? blog.id : null)}
            />
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
