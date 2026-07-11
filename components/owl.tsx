"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Owly.
 *
 * Hand-drawn rather than a Lottie: a canned animation loop can't watch the cursor,
 * blink on its own clock, or notice that you have stopped moving. Character needs
 * state, not a film strip.
 *
 * He idles, tracks the pointer with his pupils, blinks, does the odd small thing on
 * his own, hops between perches, and falls asleep if left alone. Clicking him wakes
 * him and gets a hoot.
 */

type Mood = "awake" | "sleeping";
type Beat = "idle" | "tilt" | "stretch" | "flap" | "hop";

/** Perches, as a fraction of the viewport. Kept to the left so he never sits under
 *  the player card, which is pinned bottom-centre. */
const PERCHES = [
  { x: 0.04, y: 0.20 },
  { x: 0.13, y: 0.28 },
  { x: 0.05, y: 0.40 },
  { x: 0.17, y: 0.18 },
];

const HOOTS = [
  "Hoo goes there?",
  "Still scrolling?",
  "I live here now.",
  "Nice of you to drop by.",
  "That's Tarun. I just work here.",
  "Try clicking things.",
];

const IDLE_BEFORE_SLEEP_MS = 30_000;

function randomOf<T>(items: readonly T[], not?: T): T {
  const pool = not === undefined ? items : items.filter((i) => i !== not);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function Owl() {
  const reducedMotion = usePrefersReducedMotion();

  const [mood, setMood] = useState<Mood>("awake");
  const [beat, setBeat] = useState<Beat>("idle");
  const [perch, setPerch] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const [hoot, setHoot] = useState<string | null>(null);

  // Stamped on mount, not in render — Date.now() during render is impure.
  const lastActivity = useRef(0);
  const rootRef = useRef<HTMLButtonElement>(null);

  // Pupils follow the pointer. Springs so the eyes glide rather than snap.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const eyeX = useSpring(px, { stiffness: 140, damping: 18 });
  const eyeY = useSpring(py, { stiffness: 140, damping: 18 });
  const pupilX = useTransform(eyeX, (v) => v * 3.4);
  const pupilY = useTransform(eyeY, (v) => v * 2.6);

  // No mount gate needed: his first render is deterministic (perch 0, awake, idle),
  // so there is no hydration mismatch to guard against.
  useEffect(() => {
    lastActivity.current = Date.now();
  }, []);

  // Watch the pointer, and treat any movement as a sign of life.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastActivity.current = Date.now();
      setMood((m) => (m === "sleeping" ? "awake" : m));

      const box = rootRef.current?.getBoundingClientRect();
      if (!box) return;
      const dx = e.clientX - (box.left + box.width / 2);
      const dy = e.clientY - (box.top + box.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      // Direction only — he looks *toward* you, however far away you are.
      px.set(Math.max(-1, Math.min(1, dx / dist)));
      py.set(Math.max(-1, Math.min(1, dy / dist)));
    };

    const onScroll = () => {
      lastActivity.current = Date.now();
      setMood((m) => (m === "sleeping" ? "awake" : m));
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [px, py]);

  // Nod off when nothing has happened for a while.
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastActivity.current > IDLE_BEFORE_SLEEP_MS) setMood("sleeping");
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Blink on his own clock, at irregular intervals — a metronome reads as a machine.
  useEffect(() => {
    if (mood === "sleeping" || reducedMotion) return;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 140);
        schedule();
      }, 2200 + Math.random() * 4500);
    };

    schedule();
    return () => clearTimeout(timer);
  }, [mood, reducedMotion]);

  // Do something small every so often. Hopping is rarer than the rest.
  useEffect(() => {
    if (mood === "sleeping" || reducedMotion) return;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timer = setTimeout(() => {
        const next = randomOf<Beat>(["tilt", "stretch", "flap", "hop", "idle", "idle"]);
        setBeat(next);
        // Never re-pick the perch he is already on, or the "hop" is just a bounce.
        if (next === "hop") setPerch((p) => randomOf(PERCHES.map((_, i) => i), p));
        setTimeout(() => setBeat("idle"), 1200);
        schedule();
      }, 5000 + Math.random() * 7000);
    };

    schedule();
    return () => clearTimeout(timer);
  }, [mood, reducedMotion]);

  const poke = useCallback(() => {
    lastActivity.current = Date.now();
    if (mood === "sleeping") {
      setMood("awake");
      return;
    }
    setBeat("flap");
    setHoot(randomOf(HOOTS, hoot ?? undefined));
    setTimeout(() => setBeat("idle"), 900);
    setTimeout(() => setHoot(null), 2600);
  }, [mood, hoot]);

  const asleep = mood === "sleeping";
  const spot = PERCHES[perch];
  const lidsClosed = asleep || blinking;

  return (
    <motion.button
      ref={rootRef}
      type="button"
      onClick={poke}
      aria-label={asleep ? "Wake Owly" : "Poke Owly"}
      className="fixed z-40 cursor-pointer select-none border-0 bg-transparent p-0"
      style={{ left: `${spot.x * 100}vw`, bottom: `${spot.y * 100}vh` }}
      animate={
        reducedMotion
          ? undefined
          : {
              // The hop: a little lift, and he leans into the landing.
              y: beat === "hop" ? [0, -26, 0] : beat === "stretch" ? [0, -5, 0] : 0,
              rotate: beat === "tilt" ? [0, -9, 0] : beat === "hop" ? [0, 5, 0] : 0,
              scaleY: beat === "stretch" ? [1, 1.07, 1] : 1,
            }
      }
      transition={{ duration: beat === "hop" ? 0.7 : 1, ease: "easeInOut" }}
      // The perch move itself is a slow glide, separate from the hop bounce.
      layout
    >
      {/* Hoot */}
      {hoot && (
        <motion.span
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute -top-9 left-0 whitespace-nowrap rounded-full bg-[#043360] px-3 py-1 text-[11px] font-medium text-white shadow-lg"
        >
          {hoot}
        </motion.span>
      )}

      {/* Snoozing */}
      {asleep && !reducedMotion && (
        <motion.span
          className="absolute -top-4 right-0 text-xs font-bold text-[#043360]"
          animate={{ opacity: [0, 1, 0], y: [0, -10, -18] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        >
          z
        </motion.span>
      )}

      <motion.svg
        className="h-[56px] w-[50px] sm:h-[70px] sm:w-[62px]"
        viewBox="0 0 100 112"
        aria-hidden="true"
        // Breathing. Slow enough to read as alive rather than as an animation.
        animate={reducedMotion ? undefined : { scale: asleep ? [1, 1.03, 1] : [1, 1.015, 1] }}
        transition={{ duration: asleep ? 4 : 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Ear tufts */}
        <path d="M22 30 L16 8 L38 22 Z" fill="#043360" />
        <path d="M78 30 L84 8 L62 22 Z" fill="#043360" />

        {/* Wings — they swing out on a flap */}
        <motion.ellipse
          cx="16" cy="64" rx="11" ry="24" fill="#03294c"
          style={{ originX: "16px", originY: "46px" }}
          animate={reducedMotion ? undefined : { rotate: beat === "flap" ? [0, -38, 0, -30, 0] : 0 }}
          transition={{ duration: 0.85, ease: "easeInOut" }}
        />
        <motion.ellipse
          cx="84" cy="64" rx="11" ry="24" fill="#03294c"
          style={{ originX: "84px", originY: "46px" }}
          animate={reducedMotion ? undefined : { rotate: beat === "flap" ? [0, 38, 0, 30, 0] : 0 }}
          transition={{ duration: 0.85, ease: "easeInOut" }}
        />

        {/* Body */}
        <ellipse cx="50" cy="62" rx="38" ry="44" fill="#043360" />
        {/* Belly */}
        <ellipse cx="50" cy="74" rx="24" ry="29" fill="#FAF9F6" opacity="0.92" />

        {/* Eyes */}
        <circle cx="35" cy="48" r="16" fill="#FAF9F6" />
        <circle cx="65" cy="48" r="16" fill="#FAF9F6" />

        {/* Pupils — they track you */}
        <motion.circle cx="35" cy="48" r="7.5" fill="#0b1b2b" style={{ x: pupilX, y: pupilY }} />
        <motion.circle cx="65" cy="48" r="7.5" fill="#0b1b2b" style={{ x: pupilX, y: pupilY }} />
        <motion.circle cx="32.5" cy="45" r="2.4" fill="#fff" style={{ x: pupilX, y: pupilY }} />
        <motion.circle cx="62.5" cy="45" r="2.4" fill="#fff" style={{ x: pupilX, y: pupilY }} />

        {/* Lids. Scaling from the top edge is what makes them read as closing over
            the eye rather than as a shrinking disc. */}
        <motion.rect
          x="19" y="32" width="32" height="32" rx="15" fill="#043360"
          style={{ originX: "35px", originY: "32px" }}
          animate={{ scaleY: lidsClosed ? 1 : 0 }}
          transition={{ duration: 0.12 }}
        />
        <motion.rect
          x="49" y="32" width="32" height="32" rx="15" fill="#043360"
          style={{ originX: "65px", originY: "32px" }}
          animate={{ scaleY: lidsClosed ? 1 : 0 }}
          transition={{ duration: 0.12 }}
        />

        {/* Beak */}
        <path d="M50 56 L57 66 L43 66 Z" fill="#E8A33D" />

        {/* Feet */}
        <path d="M38 103 l0 6 M34 109 h9 M62 103 l0 6 M57 109 h9" stroke="#E8A33D" strokeWidth="3.5" strokeLinecap="round" />
      </motion.svg>
    </motion.button>
  );
}
