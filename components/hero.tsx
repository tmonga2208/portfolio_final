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

/** All five photos, ordered to mirror the 3D composition: tall centre, smaller flanks. */
const PHOTOS = [
  { src: "/img1.JPG", width: "16%", aspect: "aspect-3/4" },
  { src: "/img2.jpg", width: "16%", aspect: "aspect-3/4" },
  { src: "/img5.jpeg", width: "26%", aspect: "aspect-4/5" },
  { src: "/img3.JPG", width: "16%", aspect: "aspect-3/4" },
  { src: "/img4.jpg", width: "16%", aspect: "aspect-3/4" },
];

/**
 * The photos as plain DOM. Used on phones, under reduced motion, if WebGL fails, and
 * — importantly — while the canvas textures are still downloading, so the hero is
 * never empty.
 */
function StaticGallery() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-3 px-4 md:gap-5">
      {PHOTOS.map((photo, i) => (
        <motion.div
          key={photo.src}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08 * i, ease: EASE }}
          style={{ width: photo.width }}
          className={`media-frame relative overflow-hidden rounded-2xl border border-border ${photo.aspect}`}
        >
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(max-width: 768px) 30vw, 25vw"
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
    <section className="relative flex min-h-[92vh] flex-col justify-between overflow-hidden pt-28 pb-10">
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
      <div className="relative my-6 h-[46vh] min-h-[280px] w-full md:h-[52vh]">
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
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
