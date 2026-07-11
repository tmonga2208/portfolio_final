"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const wordmark: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const letter: Variants = {
  hidden: { y: "115%" },
  show: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

/**
 * The scattered composition from the WebGL gallery, rebuilt in DOM: a large centre
 * photo with four satellites set back from it.
 *
 * `x`/`y` place the centre of each frame in the band, `h` is its height as a
 * fraction of the band (sizing by height is what makes them fill it; the width
 * follows from the aspect ratio).
 *
 * Phones get their own coordinates — `m` — and a different idea: the big photo holds
 * the middle while the four uprights run off the left and right edges, cropped by the
 * section. Bleeding them is what buys the size; contained inside 390px they could
 * only ever be stamps. The centre stays fully in frame.
 *
 * `depth` is how far back a photo sits, and it drives three things at once: it damps
 * the parallax, softens the shadow, and drops the photo behind the ones in front.
 * That is what gives the cluster its layering.
 */
const PHOTOS = [
  { src: "/img1.JPG", aspect: "aspect-3/4", depth: 0.9, d: { x: "15%", y: "30%", h: "56%" }, m: { x: "3%", y: "24%", h: "40%" } },
  { src: "/img2.jpg", aspect: "aspect-4/5", depth: 0.6, d: { x: "24%", y: "73%", h: "51%" }, m: { x: "8%", y: "77%", h: "38%" } },
  { src: "/img5.jpeg", aspect: "aspect-4/5", depth: 0, d: { x: "50%", y: "50%", h: "100%" }, m: { x: "50%", y: "50%", h: "68%" } },
  { src: "/img3.JPG", aspect: "aspect-4/5", depth: 0.8, d: { x: "85%", y: "27%", h: "53%" }, m: { x: "97%", y: "25%", h: "39%" } },
  { src: "/img4.jpg", aspect: "aspect-3/4", depth: 0.45, d: { x: "77%", y: "72%", h: "56%" }, m: { x: "92%", y: "78%", h: "41%" } },
];

/** How far the cluster leans toward the cursor, in px, before depth damping. */
const PARALLAX = 26;

type Photo = (typeof PHOTOS)[number];

function Frame({
  photo,
  index,
  sx,
  sy,
  reducedMotion,
}: {
  photo: Photo;
  index: number;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  reducedMotion: boolean;
}) {
  // Nearer photos travel further with the cursor. That difference is the depth cue.
  const lean = (1 - photo.depth) * PARALLAX;
  const x = useTransform(sx, (v) => v * lean);
  const y = useTransform(sy, (v) => v * lean);

  return (
    <div
      style={
        {
          "--x": photo.m.x,
          "--y": photo.m.y,
          "--h": photo.m.h,
          "--dx": photo.d.x,
          "--dy": photo.d.y,
          "--dh": photo.d.h,
          zIndex: Math.round((1 - photo.depth) * 10),
        } as CSSProperties
      }
      className="absolute left-[var(--x)] top-[var(--y)] h-[var(--h)] w-auto -translate-x-1/2 -translate-y-1/2 md:left-[var(--dx)] md:top-[var(--dy)] md:h-[var(--dh)]"
    >
      {/* Parallax */}
      <motion.div className="h-full w-full" style={reducedMotion ? undefined : { x, y }}>
        {/* Idle drift — each on its own clock, so the cluster never pulses in unison */}
        <motion.div
          className="h-full w-full"
          animate={reducedMotion ? undefined : { y: [0, -9, 0] }}
          transition={{
            duration: 6 + index * 1.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 * index, ease: EASE }}
            whileHover={reducedMotion ? undefined : { scale: 1.04 }}
            className={`media-frame relative h-full w-full overflow-hidden rounded-2xl border border-black/5 ${photo.aspect}`}
            style={{
              // Photos set further back cast a shallower, softer shadow.
              boxShadow: `0 ${18 - photo.depth * 10}px ${44 - photo.depth * 18}px -12px rgba(4, 51, 96, ${0.3 - photo.depth * 0.14})`,
            }}
          >
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 24vw"
              className="object-cover"
              priority={index === 2}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Gallery() {
  const reducedMotion = usePrefersReducedMotion();
  const bandRef = useRef<HTMLDivElement>(null);

  // One pointer signal for the whole cluster; each photo scales it by its depth.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 20, mass: 0.6 });

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = bandRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    py.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={bandRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      // Height-bounded on both. A scatter overlaps, so it packs into less height than
      // a grid of the same photos — which is what keeps the wordmark clear of the
      // player card pinned to the bottom of a phone's viewport.
      className="relative my-6 h-[52svh] w-full px-4 md:my-4 md:h-[58vh] md:px-6"
    >
      {PHOTOS.map((photo, i) => (
        <Frame
          key={photo.src}
          photo={photo}
          index={i}
          sx={sx}
          sy={sy}
          reducedMotion={reducedMotion}
        />
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-[88svh] flex-col justify-between overflow-hidden pt-24 pb-10 md:min-h-[98vh] md:pt-28">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="relative z-10 mx-6 flex items-baseline justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground md:mx-10"
      >
        <span>Software Engineer</span>
        <span className="hidden md:block">Frontend &amp; Design Systems</span>
        <span>Est. 2025</span>
      </motion.div>

      <Gallery />

      <div className="relative z-10 mx-6 md:mx-10">
        <motion.h1
          variants={wordmark}
          initial="hidden"
          animate="show"
          aria-label="Tarun Monga"
          className="flex w-full justify-between text-[15vw] font-bold leading-[0.85] tracking-tight text-[#043360] md:text-[13vw]"
        >
          {"TARUN MONGA".split("").map((char, i) => (
            <span key={`${char}-${i}`} aria-hidden className="overflow-hidden py-[0.04em]">
              <motion.span variants={letter} className="block">
                {char === " " ? " " : char}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-6 flex items-end justify-between border-t border-border pt-4"
        >
          <p className="max-w-md text-lg leading-snug text-muted-foreground">
            I build considered interfaces — React, TypeScript, and the design systems that hold them together.
          </p>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted-foreground md:block">
            Scroll ↓
          </span>
        </motion.div>
      </div>
    </section>
  );
}
