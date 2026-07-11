"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { useCursorPosition } from "./useCursorPosition";

export type CursorFollowProps = {
  children: React.ReactNode;
  className?: string;
};

const MIN_BUBBLE_WIDTH = 40;
const BUBBLE_HEIGHT = 40;
const TEXT_PADDING = 32;
/** Gap between the pointer and the label bubble, so the two never overlap. */
const LABEL_OFFSET = 18;

const CursorFollow: React.FC<CursorFollowProps> = ({
  children,
  className = "",
}) => {
  const { x: mouseX, y: mouseY } = useCursorPosition();
  const [cursorText, setCursorText] = useState<string | null>(null);
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [textWidth, setTextWidth] = useState<number>(0);
  const measureRef = useRef<HTMLSpanElement>(null);

  // Motion values for smooth follow
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 350, damping: 40 });
  const springY = useSpring(y, { stiffness: 350, damping: 40 });

  const bubbleWidth = cursorText
    ? Math.max(textWidth + TEXT_PADDING, MIN_BUBBLE_WIDTH)
    : MIN_BUBBLE_WIDTH;

  /**
   * Hang the label below-right of the pointer rather than under it, flipping at
   * the viewport edges so it stays on screen and readable.
   *
   * `jump` snaps the spring instead of animating it. On the hover that first
   * reveals the label, the spring is still parked wherever it was left — the
   * origin, on a fresh page — and easing from there sends the label flying in
   * from the top-left corner. Snap it onto the pointer instead, and only then
   * let the spring take over.
   */
  const place = (px: number, py: number, width: number, jump = false) => {
    const flipX = px + LABEL_OFFSET + width > window.innerWidth;
    const flipY = py + LABEL_OFFSET + BUBBLE_HEIGHT > window.innerHeight;

    const targetX = flipX ? px - LABEL_OFFSET - width : px + LABEL_OFFSET;
    const targetY = flipY ? py - LABEL_OFFSET - BUBBLE_HEIGHT : py + LABEL_OFFSET;

    x.set(targetX);
    y.set(targetY);

    if (jump) {
      springX.jump(targetX);
      springY.jump(targetY);
    }
  };

  // Steady-state following once the label is up.
  useEffect(() => {
    place(mouseX, mouseY, bubbleWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseX, mouseY, bubbleWidth]);

  // Pre-measure text width before showing bubble
  useEffect(() => {
    if (pendingText && measureRef.current) {
      const width = measureRef.current.offsetWidth;
      setTextWidth(width);
      setCursorText(pendingText);
      setPendingText(null);
    }
    if (!(pendingText || cursorText)) {
      setTextWidth(0);
    }
  }, [pendingText, cursorText]);

  const clear = () => {
    setCursorText(null);
    setPendingText(null);
  };

  // Read the label off the nearest labelled ancestor, not off the exact element
  // under the pointer: the cells wrap a logo, and hovering that logo would
  // otherwise find no data-cursor-text and drop the label mid-hover.
  const show = (target: EventTarget | null) => {
    const labelled = (target as HTMLElement | null)?.closest?.("[data-cursor-text]");
    const text = labelled?.getAttribute("data-cursor-text") ?? null;

    if (!text) {
      clear();
      return;
    }
    if (text === cursorText) return;
    setPendingText(text);
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    // Take the coordinates off the event rather than the tracked state: on the
    // very first move the state hasn't propagated yet, and the label would mount
    // at the origin.
    if (!cursorText) place(e.clientX, e.clientY, bubbleWidth, true);
    show(e.target);
  };
  const handleFocus = (e: React.FocusEvent) => show(e.target);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Interactive cursor tracking widget requires mouse events
    <div
      className={`relative h-full w-full ${className}`}
      onBlur={clear}
      onFocus={handleFocus}
      // mouseout fires on every hop between child nodes, so clearing there made
      // the label flicker. mouseover re-resolves the label (or clears it), and
      // mouseleave handles actually leaving the section.
      onMouseLeave={clear}
      onMouseOver={handleMouseOver}
      role="application"
      // No cursor: "none" here. The dot used to stand in for the pointer, so
      // hiding the real one was load-bearing; with only the label left, hiding it
      // would leave this section with no cursor at all.
      style={{ minHeight: 300 }}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Interactive cursor tracking widget requires focus
      tabIndex={0}
    >
      {children}

      <AnimatePresence>
        {cursorText && (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none fixed z-50 flex items-center justify-center rounded-full font-medium text-xs shadow-lg"
            exit={{ opacity: 0, scale: 0.8 }}
            initial={{ opacity: 0, scale: 0.8 }}
            style={{
              left: 0,
              top: 0,
              x: springX,
              y: springY,
              width: bubbleWidth,
              height: BUBBLE_HEIGHT,
              background: "var(--color-brand, #6366f1)",
              color: "#fff",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
            }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {cursorText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Off-screen copy, measured to size the bubble before it's shown. */}
      {(pendingText || cursorText) && (
        <span
          ref={measureRef}
          style={{
            position: "fixed",
            visibility: "hidden",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontSize: "0.75rem",
            fontWeight: 500,
            fontFamily: "inherit",
          }}
        >
          {pendingText || cursorText}
        </span>
      )}
    </div>
  );
};

export default CursorFollow;
