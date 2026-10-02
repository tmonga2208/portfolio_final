"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A story opened from the home page. It rises over the page while the address
 * changes to /travel/<slug>, so the link can be shared and Back closes it.
 * Visiting that address directly shows the full page instead.
 *
 * It renders in the root layout's @modal slot, outside the home page's tree, so
 * it sets its own font and needs no portal to escape transformed ancestors.
 */
export function StoryOverlay({ slug, children }: { slug: string; children: React.ReactNode }) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  const close = useCallback(() => setClosing(true), []);

  // Lock the page behind it, and close on Escape.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-crimson md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.25 }}
      // Fade out first, then leave: going back is what removes the story.
      onAnimationComplete={() => {
        if (closing) router.back();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" onClick={close} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-title"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[40px] bg-background shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          autoFocus
          aria-label="Close story"
          className="absolute top-6 right-6 z-10 rounded-full bg-black/10 p-2 backdrop-blur-md transition-colors hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
        >
          <X className="size-5" />
        </button>
        {/* Keyed by story, so moving to the next trip starts at its top. */}
        <ScrollArea key={slug} className="h-full w-full">
          {children}
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}
