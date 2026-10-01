"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type Toast = { id: number; message: string };

const EVENT = "app:toast";
const DURATION_MS = 2200;

/** Fire-and-forget toast from anywhere on the page. */
export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: message }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let nextId = 0;
    const onToast = (e: Event) => {
      const id = nextId++;
      const message = (e as CustomEvent<string>).detail;
      setToasts((list) => [...list, { id, message }]);
      setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), DURATION_MS);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    // Sits above the music player, which owns the bottom-centre of the screen.
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-28 z-[110] flex flex-col items-center gap-2 font-sans"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground shadow-lg"
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
