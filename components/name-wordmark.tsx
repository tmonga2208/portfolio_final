"use client";

import { motion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const wordmark: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const letter: Variants = {
  hidden: { y: "115%" },
  show: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

// The letters set to ~6.4em; the type is sized so they plus the 0.3em word gap
// always fit, rather than squeezing (and clipping) each letter.
const CLASSES =
  "flex w-full justify-between text-[12.5vw] font-bold leading-[0.85] tracking-tight text-brand md:text-[min(13vw,14rem)]";

/**
 * TARUN MONGA set edge to edge, each letter rising out of a clipped line.
 * In the hero it's the page's h1 and plays on load; in the footer it's a
 * decorative bookend (the name is already there in text) that plays when
 * scrolled into view.
 */
export function NameWordmark({ placement }: { placement: "hero" | "footer" }) {
  const letters = "TARUN MONGA".split("").map((char, i) => (
    <span
      key={`${char}-${i}`}
      aria-hidden
      className={`shrink-0 overflow-hidden py-[0.04em] ${char === " " ? "w-[0.3em]" : ""}`}
    >
      <motion.span variants={letter} className="block">
        {char}
      </motion.span>
    </span>
  ));

  return placement === "hero" ? (
    <motion.h1 variants={wordmark} initial="hidden" animate="show" aria-label="Tarun Monga" className={CLASSES}>
      {letters}
    </motion.h1>
  ) : (
    <motion.div
      variants={wordmark}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      aria-hidden
      className={CLASSES}
    >
      {letters}
    </motion.div>
  );
}
