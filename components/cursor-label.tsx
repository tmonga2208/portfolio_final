"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MIN_BUBBLE_WIDTH = 40;
const BUBBLE_HEIGHT = 40;
const TEXT_PADDING = 32;
/** Gap between the pointer and the label bubble, so the two never overlap. */
const LABEL_OFFSET = 18;

/**
 * One label bubble for the whole site. Any element with `data-cursor-text` gets
 * its text shown next to the pointer while hovered.
 *
 * This used to be a wrapper (`CursorFollow`) around individual sections, so a
 * label only worked if someone remembered to wrap its section — the contact
 * link and the travel polaroids carried labels that never showed. Listening on
 * the document instead means the attribute alone is enough.
 */
export function CursorLabel() {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [width, setWidth] = useState(MIN_BUBBLE_WIDTH);
  const measureRef = useRef<HTMLSpanElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const widthRef = useRef(MIN_BUBBLE_WIDTH);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 350, damping: 40 });
  const springY = useSpring(y, { stiffness: 350, damping: 40 });

  // Touch screens have no hover, and a label stuck after a tap is just noise.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /**
   * Hang the label below-right of the pointer, flipping at the viewport edges.
   * `jump` snaps the spring so a freshly shown label doesn't fly in from
   * wherever it was last parked.
   */
  const place = (jump = false) => {
    const { x: px, y: py } = pointer.current;
    const w = widthRef.current;
    const flipX = px + LABEL_OFFSET + w > window.innerWidth;
    const flipY = py + LABEL_OFFSET + BUBBLE_HEIGHT > window.innerHeight;
    const tx = flipX ? px - LABEL_OFFSET - w : px + LABEL_OFFSET;
    const ty = flipY ? py - LABEL_OFFSET - BUBBLE_HEIGHT : py + LABEL_OFFSET;
    x.set(tx);
    y.set(ty);
    if (jump) {
      springX.jump(tx);
      springY.jump(ty);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setText(null);
      return;
    }

    let current: string | null = null;

    const onMove = (e: MouseEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      if (current) place();
    };

    // Resolve off the nearest labelled ancestor, so hovering a logo or image
    // inside a labelled cell keeps the cell's label.
    const onOver = (e: MouseEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      const labelled = (e.target as Element | null)?.closest?.("[data-cursor-text]");
      const next = labelled?.getAttribute("data-cursor-text") || null;
      if (next === current) return;
      if (!current && next) place(true);
      current = next;
      setText(next);
    };

    const clear = () => {
      current = null;
      setText(null);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", clear);
    // Labels describe what's under a still pointer; scrolling moves the page
    // out from under it, so drop the label rather than leave it stale.
    window.addEventListener("scroll", clear, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", clear);
      window.removeEventListener("scroll", clear);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Size the bubble to the text before it paints.
  useLayoutEffect(() => {
    if (!text || !measureRef.current) return;
    const w = Math.max(measureRef.current.offsetWidth + TEXT_PADDING, MIN_BUBBLE_WIDTH);
    widthRef.current = w;
    setWidth(w);
    place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  if (!enabled) return null;

  return (
    <>
      <AnimatePresence>
        {text && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="pointer-events-none fixed left-0 top-0 z-[120] flex items-center justify-center whitespace-nowrap rounded-full bg-brand font-sans text-xs font-medium text-brand-foreground shadow-lg"
            style={{ x: springX, y: springY, width, height: BUBBLE_HEIGHT }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Off-screen copy, measured to size the bubble. */}
      <span
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible fixed whitespace-nowrap font-sans text-xs font-medium"
      >
        {text}
      </span>
    </>
  );
}
