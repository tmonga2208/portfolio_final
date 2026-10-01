"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/components/toast";
import { EMAIL } from "@/lib/contact";

const SECRET_WORD = "swim";
/** Phones can't type the secret, so tapping the word works too: this many taps, this fast. */
const SWIM_TAPS = 5;
const SWIM_TAP_WINDOW_MS = 2500;
const SWIM_EVENT = "easter:swim";
const AWAY_TITLE = "Come back, the pool's warm 🏊";

const BANNER = [
  "  _____ _   ___ _   _ _  _   __  __  ___  _  _  ___   _",
  " |_   _/_\\ | _ \\ | | | \\| | |  \\/  |/ _ \\| \\| |/ __| /_\\",
  "   | |/ _ \\|   / |_| | .` | | |\\/| | (_) | .` | (_ |/ _ \\",
  "   |_/_/ \\_\\_|_\\\\___/|_|\\_| |_|  |_|\\___/|_|\\_|\\___/_/ \\_\\",
].join("\n");

/** Effects run twice under StrictMode in dev; greet the console once per page load. */
let greeted = false;
const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

type Effect = { id: number; kind: "ripple" | "bubbles" };

/** Deterministic per-bubble variety, so renders don't reshuffle mid-animation. */
const BUBBLES = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 10 + ((i * 13) % 26),
  delay: ((i * 7) % 12) / 10,
  duration: 2.4 + ((i * 5) % 10) / 6,
  drift: ((i % 5) - 2) * 18,
}));

/**
 * Small secrets, mostly hinted at by the "swim" in the About section:
 * - typing "swim" anywhere (or tapping the word five times) sends ripples
 *   across the screen;
 * - the Konami code sends a column of bubbles up the page;
 * - the console greets anyone who opens DevTools;
 * - the tab title calls you back while you're on another tab.
 */
export function EasterEggs() {
  const [effects, setEffects] = useState<Effect[]>([]);

  useEffect(() => {
    let typed = "";
    let konamiAt = 0;
    let nextId = 0;

    const trigger = (kind: Effect["kind"], message: string) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        toast(message);
        return;
      }
      const id = nextId++;
      setEffects((list) => [...list, { id, kind }]);
      toast(message);
      setTimeout(() => setEffects((list) => list.filter((e) => e.id !== id)), 4500);
    };

    const onKey = (e: KeyboardEvent) => {
      // Don't eavesdrop on real typing.
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key.length === 1) {
        typed = (typed + key).slice(-SECRET_WORD.length);
        if (typed === SECRET_WORD) {
          typed = "";
          trigger("ripple", "🏊 Splash! Lap complete.");
        }
      }

      konamiAt = key === KONAMI[konamiAt] ? konamiAt + 1 : key === KONAMI[0] ? 1 : 0;
      if (konamiAt === KONAMI.length) {
        konamiAt = 0;
        trigger("bubbles", "🫧 Cheat code accepted. Infinite oxygen.");
      }
    };

    const onSwimTaps = () => trigger("ripple", "🏊 Splash! Lap complete.");

    let titleBeforeAway: string | null = null;
    const onVisibility = () => {
      if (document.hidden) {
        titleBeforeAway = document.title;
        document.title = AWAY_TITLE;
      } else if (titleBeforeAway !== null) {
        document.title = titleBeforeAway;
        titleBeforeAway = null;
      }
    };

    if (!greeted) {
      greeted = true;
      console.log(
        `%c${BANNER}%c\n\nYou opened the console, so you're my kind of person.\nSay hi: ${EMAIL}`,
        "font-family: ui-monospace, Menlo, monospace; font-weight: 700",
        "font-family: system-ui, sans-serif; font-size: 13px"
      );
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener(SWIM_EVENT, onSwimTaps);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(SWIM_EVENT, onSwimTaps);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[105] overflow-hidden">
      <AnimatePresence>
        {effects.map((effect) =>
          effect.kind === "ripple" ? (
            <motion.div key={effect.id} exit={{ opacity: 0 }} className="absolute inset-0">
              {[0, 0.35, 0.7, 1.05].map((delay) => (
                <motion.span
                  key={delay}
                  initial={{ scale: 0, opacity: 0.55 }}
                  animate={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 2.2, delay, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-1/2 top-1/2 -ml-[75vmax] -mt-[75vmax] size-[150vmax] rounded-full border-[6px] border-brand"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div key={effect.id} exit={{ opacity: 0 }} className="absolute inset-0">
              {BUBBLES.map((b, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "10vh", x: 0, opacity: 0 }}
                  animate={{ y: "-110vh", x: b.drift, opacity: [0, 0.9, 0.9, 0] }}
                  transition={{ duration: b.duration, delay: b.delay, ease: "easeIn" }}
                  className="absolute bottom-0 rounded-full border-2 border-brand/70 bg-brand/10"
                  style={{ left: `${b.left}%`, width: b.size, height: b.size }}
                />
              ))}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}

/** The "swim" in the About section. Five quick taps set off the ripple. */
export function SwimWord() {
  const taps = useRef<number[]>([]);

  return (
    <span
      onClick={() => {
        const now = performance.now();
        taps.current = [...taps.current.filter((t) => now - t < SWIM_TAP_WINDOW_MS), now];
        if (taps.current.length >= SWIM_TAPS) {
          taps.current = [];
          window.dispatchEvent(new Event(SWIM_EVENT));
        }
      }}
      data-cursor-text="psst — type it"
      // Rapid taps would otherwise select the word or zoom the page.
      className="touch-manipulation select-none font-semibold italic text-brand"
    >
      swim
    </span>
  );
}
