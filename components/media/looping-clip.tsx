"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A short silent loop that plays only while on screen, and not at all with
 * reduced motion (the poster shows instead). No controls, downloads or
 * picture-in-picture: clips are part of the page, not something to take away.
 */
export function LoopingClip({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { margin: "100px" });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (inView && !reducedMotion) video.play().catch(() => {});
    else video.pause();
  }, [inView, reducedMotion]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload nofullscreen noremoteplayback"
      tabIndex={-1}
      className={cn("pointer-events-none", className)}
    />
  );
}
