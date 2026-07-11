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
 * `x`/`y` place the centre of each frame in the band. `height` is a fraction of the
 * band — sizing by height is what makes them fill it; the width follows from the
 * aspect ratio. `depth` is how far back the photo sits: it damps the parallax,
 * softens the shadow and drops it behind the ones in front, which is what gives the
 * cluster its layering.
 */
const PHOTOS = [
  { src: "/img1.JPG", x: "15%", y: "30%", height: "56%", depth: 0.9, aspect: "aspect-square md:aspect-3/4", wide: false },
  { src: "/img2.jpg", x: "24%", y: "73%", height: "51%", depth: 0.6, aspect: "aspect-square md:aspect-4/5", wide: false },
  { src: "/img5.jpeg", x: "50%", y: "50%", height: "100%", depth: 0, aspect: "aspect-16/9 md:aspect-3/4", wide: true },
  { src: "/img3.JPG", x: "85%", y: "27%", height: "53%", depth: 0.8, aspect: "aspect-square md:aspect-4/5", wide: false },
  { src: "/img4.jpg", x: "77%", y: "72%", height: "56%", depth: 0.45, aspect: "aspect-square md:aspect-3/4", wide: false },
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
          "--x": photo.x,
          "--y": photo.y,
          "--h": photo.height,
          zIndex: Math.round((1 - photo.depth) * 10),
        } as CSSProperties
      }
      className={`md:absolute md:left-[var(--x)] md:top-[var(--y)] md:h-[var(--h)] md:w-auto md:-translate-x-1/2 md:-translate-y-1/2 ${
        photo.wide ? "col-span-2 md:col-span-1" : ""
      }`}
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
      className="my-8 grid w-full grid-cols-2 items-center gap-3 px-4 md:relative md:my-4 md:block md:h-[58vh] md:px-6"
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
