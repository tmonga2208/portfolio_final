"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "@/components/toast";

const SECRET_WORD = "swim";
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
 * Two small secrets, hinted at by the "swim" in the About section:
 * typing "swim" anywhere sends ripples across the screen, and the Konami code
 * sends a column of bubbles up the page.
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

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
