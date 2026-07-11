"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import type { CSSProperties } from "react";

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
 * The five photos, as a staggered band rather than a centred row.
 *
 * `height` is a fraction of the band, not a width — sizing by height is what lets
 * them fill it. Sized by width (the old approach) a phone-sized column left a
 * 112px photo adrift in a 388px box. Widths follow from the aspect ratio.
 *
 * `shift` drops each one to a different baseline so the band reads as a
 * composition instead of a row of stamps.
 */
const PHOTOS = [
  { src: "/img1.JPG", height: "72%", shift: "-6%", aspect: "aspect-square md:aspect-3/4", wide: false },
  { src: "/img2.jpg", height: "56%", shift: "16%", aspect: "aspect-square md:aspect-3/4", wide: false },
  // Spans both columns on mobile. Five photos into a two-column grid otherwise
  // strands the last one alone on its own row.
  { src: "/img5.jpeg", height: "100%", shift: "-2%", aspect: "aspect-16/9 md:aspect-4/5", wide: true },
  { src: "/img3.JPG", height: "62%", shift: "18%", aspect: "aspect-square md:aspect-3/4", wide: false },
  { src: "/img4.jpg", height: "80%", shift: "-4%", aspect: "aspect-square md:aspect-3/4", wide: false },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[88svh] flex-col justify-between overflow-hidden pt-24 pb-10 md:min-h-[96vh] md:pt-28">
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

      {/* The band. Height-driven and full-bleed from md up so the photos reach the
          edges; a wrapped collage below that, where five across a phone would only
          ever be postage stamps. */}
      <div className="my-8 w-full px-4 md:my-6 md:h-[52vh] md:px-6">
        <div className="grid h-full grid-cols-2 items-center gap-3 md:flex md:flex-nowrap md:justify-between md:gap-4">
          {PHOTOS.map((photo, i) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.08 * i, ease: EASE }}
              style={{ "--h": photo.height, "--dy": photo.shift } as CSSProperties}
              className={`media-frame relative overflow-hidden rounded-2xl border border-border md:w-auto md:h-[var(--h)] md:translate-y-[var(--dy)] ${photo.aspect} ${
                photo.wide ? "col-span-2 md:col-span-1" : ""
              }`}
            >
              <Image
                src={photo.src}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 22vw"
                className="object-cover"
                priority={i === 2}
              />
            </motion.div>
          ))}
        </div>
      </div>

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
