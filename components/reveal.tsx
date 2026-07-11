"use client";

import { motion, type Variants } from "framer-motion";
import { useCallback, useRef, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: 36, y: 0 },
  right: { x: -36, y: 0 },
  none: { x: 0, y: 0 },
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A settled `filter: blur(0px)` still makes the element a containing block for
 * `position: fixed` descendants, which traps overlays (e.g. IOSFolder) inside the
 * wrapper. Motion never resolves the filter back to `none`, so we clear it ourselves
 * once the animation lands.
 */
function useClearFilterOnRest() {
  const ref = useRef<HTMLDivElement>(null);
  const clear = useCallback(() => {
    if (ref.current) ref.current.style.filter = "";
  }, []);
  return { ref, clear };
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  blur = true,
  className,
  once = true,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  blur?: boolean;
  className?: string;
  once?: boolean;
}) {
  const { x, y } = OFFSET[direction];
  const { ref, clear } = useClearFilterOnRest();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x, y, ...(blur ? { filter: "blur(6px)" } : {}) }}
      whileInView={{ opacity: 1, x: 0, y: 0, ...(blur ? { filter: "blur(0px)" } : {}) }}
      onAnimationComplete={clear}
      viewport={{ once, amount: 0.25, margin: "0px 0px -80px 0px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

/** Wrap a list so children animate in one after another. Children must be <RevealItem>. */
export function RevealGroup({
  children,
  className,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, clear } = useClearFilterOnRest();

  return (
    <motion.div ref={ref} className={className} variants={itemVariants} onAnimationComplete={clear}>
      {children}
    </motion.div>
  );
}
