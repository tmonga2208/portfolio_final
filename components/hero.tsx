"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Component, useCallback, useEffect, useState, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

// three.js is ~150KB gzipped, so it is never part of the initial bundle and never
// runs on the server.
const FloatingGallery = dynamic(() => import("@/components/three/floating-gallery"), {
  ssr: false,
  loading: () => null,
});

const EASE = [0.22, 1, 0.36, 1] as const;

const wordmark: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const letter: Variants = {
  hidden: { y: "115%" },
  show: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

/**
 * All five photos, ordered to mirror the 3D composition: tall centre, smaller flanks.
 *
 * Five across a phone leaves each one about 55px wide — too small to read as a
 * photograph. The outer pair drops below `md` so the remaining three can be
 * roughly twice the size; `mobileWidth` is what they take once that happens.
 */
const PHOTOS = [
  { src: "/img1.JPG", width: "16%", mobileWidth: null, aspect: "aspect-3/4" },
  { src: "/img2.jpg", width: "16%", mobileWidth: "26%", aspect: "aspect-3/4" },
  { src: "/img5.jpeg", width: "26%", mobileWidth: "40%", aspect: "aspect-4/5" },
  { src: "/img3.JPG", width: "16%", mobileWidth: "26%", aspect: "aspect-3/4" },
  { src: "/img4.jpg", width: "16%", mobileWidth: null, aspect: "aspect-3/4" },
];

/**
 * The photos as plain DOM. Used on phones, under reduced motion, if WebGL fails, and
 * — importantly — while the canvas textures are still downloading, so the hero is
 * never empty.
 */
function StaticGallery() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-2 px-3 md:gap-5 md:px-4">
      {PHOTOS.map((photo, i) => (
        <motion.div
          key={photo.src}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08 * i, ease: EASE }}
          style={
            {
              "--w": photo.width,
              "--w-mobile": photo.mobileWidth ?? photo.width,
            } as React.CSSProperties
          }
          className={`media-frame relative overflow-hidden rounded-2xl border border-border w-[var(--w-mobile)] md:w-[var(--w)] ${photo.aspect} ${
            photo.mobileWidth ? "" : "hidden md:block"
          }`}
        >
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(max-width: 768px) 40vw, 25vw"
            className="object-cover"
            priority={i === 2}
          />
        </motion.div>
      ))}
    </div>
  );
}

/** If WebGL is unavailable or the scene throws, keep the photos rather than a blank hero. */
class CanvasBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function Hero() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);

  // useIsMobile resolves to `false` before it measures, so wait for the client
  // before deciding whether to pay for WebGL.
  useEffect(() => setMounted(true), []);

  const handleReady = useCallback(() => setCanvasReady(true), []);
  const handleError = useCallback(() => setCanvasFailed(true), []);

  const useCanvas = mounted && !isMobile && !reducedMotion && !canvasFailed;

  return (
    // No min-height on phones. Combined with justify-between it forced the gap
    // between the header, the photos and the wordmark open to fill the viewport;
    // on mobile the section is now as tall as what's actually in it.
    <section className="relative flex flex-col justify-between overflow-hidden pt-24 pb-10 md:min-h-[92vh] md:pt-28">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mx-6 flex items-baseline justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground md:mx-10"
      >
        <span>Software Engineer</span>
        <span className="hidden md:block">Frontend &amp; Design Systems</span>
        <span>Est. 2025</span>
      </motion.div>

      {/* Gallery. The DOM photos stay mounted underneath and only fade out once the
          canvas has its textures, so there is never an empty frame. */}
      {/* Height is content-driven on mobile. The fixed 46vh was sized for the WebGL
          canvas, which never runs on phones, so it just left dead space under the
          photos. The canvas needs a real height, hence md:h-[52vh]. */}
      <div className="relative my-8 w-full md:my-6 md:h-[52vh] md:min-h-[280px]">
        {/* In flow on mobile so the photos give the container its height; absolutely
            positioned from md up, where it sits under the canvas and the parent has
            a fixed height of its own. `absolute inset-0` against an auto-height
            parent collapses to nothing and the photos spill over the wordmark. */}
        <div
          className={`relative md:absolute md:inset-0 transition-opacity duration-700 ${
            useCanvas && canvasReady ? "opacity-0" : "opacity-100"
          }`}
        >
          <StaticGallery />
        </div>

        {useCanvas && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              canvasReady ? "opacity-100" : "opacity-0"
            }`}
          >
            <CanvasBoundary onError={handleError}>
              <FloatingGallery onReady={handleReady} />
            </CanvasBoundary>
          </div>
        )}
      </div>

      <div className="mx-6 md:mx-10">
        <motion.h1
          variants={wordmark}
          initial="hidden"
          animate="show"
          aria-label="Tarun Monga"
          className="flex w-full justify-between text-[15vw] font-bold leading-[0.85] tracking-tight text-[#043360] md:text-[13vw]"
        >
          {"TARUN MONGA".split("").map((char, i) => (
            <span key={`${char}-${i}`} aria-hidden className="overflow-hidden py-[0.04em]">
              <motion.span variants={letter} className="block">
                {char === " " ? " " : char}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-6 flex items-end justify-between border-t border-border pt-4"
        >
          <p className="max-w-md text-lg leading-snug text-muted-foreground">
            I build considered interfaces — React, TypeScript, and the design systems that hold them together.
          </p>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted-foreground md:block">
            Scroll ↓
          </span>
        </motion.div>
      </div>
    </section>
  );
}
