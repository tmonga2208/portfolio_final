"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const word: Variants = {
  hidden: { y: "110%" },
  show: { y: 0, transition: { duration: 0.7, ease: EASE } },
};

const rule: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1, ease: EASE } },
};

const meta: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, delay: 0.3 } },
};

/**
 * Editorial section header: a numbered index, a title whose words rise out of a
 * clipped line, and a rule that draws itself across the column.
 */
export function SectionHeading({
  children,
  index,
  className,
}: {
  children: string;
  index?: string;
  className?: string;
}) {
  const words = children.split(" ");

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      className="w-full"
    >
      <motion.div
        variants={rule}
        style={{ transformOrigin: "left" }}
        className="mb-6 block h-px w-full bg-border"
      />
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h2
          className={cn(
            "flex flex-wrap gap-x-[0.25em] text-4xl font-bold text-[#043360] md:text-6xl",
            className
          )}
        >
          {words.map((w, i) => (
            <span key={`${w}-${i}`} className="overflow-hidden py-[0.08em] leading-[1.05]">
              <motion.span variants={word} className="block">
                {w}
              </motion.span>
            </span>
          ))}
        </h2>
        {index && (
          <motion.span
            variants={meta}
            className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
          >
            {index}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
