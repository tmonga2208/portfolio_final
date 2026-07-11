"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** All five photos, washed in behind the hero one at a time. */
const PHOTOS = ["/img5.jpeg", "/img1.JPG", "/img3.JPG", "/img2.jpg", "/img4.jpg"];

const HOLD_MS = 6000;

const wordmark: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const letter: Variants = {
  hidden: { y: "115%" },
  show: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

/**
 * The photo behind the wordmark, cross-fading through all five.
 *
 * All five are stacked and only their opacity moves, so the incoming frame is
 * already decoded when its turn comes — swapping the src would flash.
 */
function Backdrop() {
  const [index, setIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % PHOTOS.length), HOLD_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {PHOTOS.map((src, i) => (
        <motion.div
          key={src}
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: i === index ? 1 : 0,
            // A slow drift while it holds. Opacity alone is fine under reduced
            // motion; the scale is what would need suppressing.
            scale: reducedMotion ? 1 : i === index ? 1 : 1.06,
          }}
          transition={{
            opacity: { duration: 1.6, ease: "easeInOut" },
            scale: { duration: HOLD_MS / 1000 + 2, ease: "linear" },
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center opacity-[0.18] md:opacity-[0.22]"
          />
        </motion.div>
      ))}

      {/* Wash of the page colour over the photo — solid at the bottom, where the
          type sits, so the wordmark keeps its contrast whichever photo is up. */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-background/55 to-background" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-[80svh] flex-col justify-between overflow-hidden pt-24 pb-10 md:min-h-[92vh] md:pt-28">
      <Backdrop />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="relative z-10 mx-6 flex items-baseline justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground md:mx-10"
      >
        <span>Software Engineer</span>
        <span className="hidden md:block">Frontend &amp; Design Systems</span>
        <span>Est. 2025</span>
      </motion.div>

      <div className="relative z-10 mx-6 md:mx-10">
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
                {char === " " ? " " : char}
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
