"use client";

import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { motion } from "framer-motion";
import { scribbledMonth, type Trip } from "@/types/travel";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Handwriting for the note on the cover print. */
const hand = Caveat({ subsets: ["latin"], weight: "500", display: "swap" });

/** A real link, so the story can also be opened in a new tab or shared. */
const MotionLink = motion.create(Link);

/** Back-to-front: two photos peeking out behind, the cover on top. */
const CARD_POSES = [
  { rest: { rotate: -8, x: -14, y: 8 }, hover: { rotate: -16, x: -64, y: -4 } },
  { rest: { rotate: 6, x: 14, y: 2 }, hover: { rotate: 13, x: 56, y: -10 } },
  { rest: { rotate: -1, x: 0, y: -4 }, hover: { rotate: 1, x: 0, y: -26 } },
];

export function TravelPolaroid({
  trip,
  highlighted = false,
  onHoverChange,
}: {
  trip: Trip;
  /** Fan the pile out as if hovered — used when its pin is hovered on the map. */
  highlighted?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}) {
  const photos = trip.pile.slice(0, 3);
  // With fewer than 3 photos, skip the earliest poses so the last photo still
  // lands the straight cover pose instead of a tilted background one.
  const poseOffset = CARD_POSES.length - photos.length;

  return (
    <div className="flex flex-col items-center gap-6">
      <MotionLink
        href={`/travel/${trip.slug}`}
        scroll={false}
        initial="rest"
        animate={highlighted ? "hover" : "rest"}
        whileHover="hover"
        onHoverStart={() => onHoverChange?.(true)}
        onHoverEnd={() => onHoverChange?.(false)}
        whileTap={{ scale: 0.97 }}
        aria-label={`Open ${trip.title}`}
        className="relative block h-56 w-56 cursor-pointer md:h-64 md:w-64"
        data-cursor-text="Open"
      >
        {photos.map((src, i) => (
          <motion.div
            key={src}
            variants={CARD_POSES[i + poseOffset]}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute inset-0 m-auto h-fit w-40 rotate-0 rounded-sm border border-black/5 bg-white p-2 pb-8 shadow-[0_12px_30px_-12px_rgb(0_0_0/0.4)] md:w-44"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image src={src} alt="" fill sizes="176px" className="object-cover" />
            </div>
            {/* The cover print gets a note in the white strip, in navy "ballpoint"
                that stays the same in dark mode, since the print stays white. */}
            {i === photos.length - 1 && (
              <p
                className={`${hand.className} absolute inset-x-0 bottom-1 -rotate-2 text-center text-[17px] leading-none text-[#1f3a68]`}
              >
                {trip.notePlace ?? trip.location.split(",")[0]}, {scribbledMonth(trip.when)}
              </p>
            )}
          </motion.div>
        ))}
      </MotionLink>

      <div className="text-center">
        <p className="text-xl font-semibold italic text-foreground">{trip.title}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{trip.location}</p>
      </div>
    </div>
  );
}
