"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { MEDIA, type Media } from "./media";

/**
 * Proportions loosely follow real 35mm film: a band of frames with a border
 * above and below holding the sprocket holes and the amber edge printing.
 */
type Size = {
  frameH: number;
  /** Film above and below the frames. */
  border: number;
  gap: number;
  perf: { w: number; h: number; r: number; pitch: number; inset: number };
  font: number;
  /** Idle drift, px per second. */
  speed: number;
};

const SIZES: Record<"desktop" | "mobile", Size> = {
  desktop: { frameH: 120, border: 32, gap: 12, perf: { w: 13, h: 9, r: 2.5, pitch: 22, inset: 7 }, font: 9, speed: 24 },
  mobile: { frameH: 80, border: 22, gap: 8, perf: { w: 9, h: 6, r: 1.6, pitch: 15, inset: 5 }, font: 7, speed: 16 },
};

type StripConfig = {
  media: Media[];
  /** Edge number printed under the first frame. */
  firstFrame: number;
  rotate: number;
  /** Above (-1) or below (1) the middle of the section. */
  side: 1 | -1;
  /** -1 drifts left, 1 drifts right. */
  direction: 1 | -1;
};

/** Space between the two strips where they pass the middle of the section. */
const SPREAD = 24;

// Two rolls laid side by side at the same slight angle, drifting opposite
// ways. The second runs the photos backwards and carries on the frame count.
const STRIPS: StripConfig[] = [
  { media: MEDIA, firstFrame: 1, rotate: -3, side: -1, direction: -1 },
  { media: [...MEDIA].reverse(), firstFrame: MEDIA.length + 1, rotate: -3, side: 1, direction: 1 },
];

/** Copies of each roll laid end to end, so the loop point is never on screen. */
const COPIES = 3;

const EDGE_INK = "rgba(231, 163, 62, 0.85)";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/** Frame positions within one copy of a roll, and that copy's width. */
function layout(media: Media[], size: Size, firstFrame: number) {
  let x = size.gap / 2;
  const frames = media.map((m, i) => {
    const w = Math.round(size.frameH * Math.min(1.6, Math.max(0.6, m.width / m.height)));
    const frame = { media: m, x, w, number: firstFrame + i };
    x += w + size.gap;
    return frame;
  });
  // A whole number of sprocket holes per copy, so the holes line up across the
  // loop point too.
  const width = Math.ceil((x - size.gap / 2) / size.perf.pitch) * size.perf.pitch;
  return { frames, width };
}

/** One row of sprocket holes as a mask tile: opaque film with a rounded hole. */
function perfTile(size: Size, holeTop: number) {
  const { w, h, r, pitch } = size.perf;
  const x = (pitch - w) / 2;
  const hole =
    `M${x + r} ${holeTop}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}` +
    `a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}Z`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pitch}" height="${size.border}">` +
    `<path fill-rule="evenodd" d="M0 0H${pitch}V${size.border}H0Z${hole}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Cuts real holes in the film, so whatever lies underneath shows through. */
function perforationMask(size: Size): React.CSSProperties {
  const { border, frameH, perf } = size;
  const image = `${perfTile(size, perf.inset)}, ${perfTile(size, border - perf.inset - perf.h)}, linear-gradient(#000, #000)`;
  const maskSize = `${perf.pitch}px ${border}px, ${perf.pitch}px ${border}px, 100% ${frameH}px`;
  const position = "0 0, 0 100%, 0 50%";
  const repeat = "repeat-x, repeat-x, no-repeat";
  return {
    maskImage: image,
    maskSize,
    maskPosition: position,
    maskRepeat: repeat,
    WebkitMaskImage: image,
    WebkitMaskSize: maskSize,
    WebkitMaskPosition: position,
    WebkitMaskRepeat: repeat,
  };
}

function useSize() {
  const [size, setSize] = useState(SIZES.desktop);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setSize(query.matches ? SIZES.desktop : SIZES.mobile);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return size;
}

/**
 * The gallery: two strips of film crossing the section, drifting slowly the
 * opposite way to each other. Scrolling speeds them up (and scrolling back up
 * turns them round), and hovering a strip brings it to rest. Photos stay small
 * and are deliberately not openable: no click, no drag, no long-press.
 */
export function FilmStrips() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px" });
  const reducedMotion = Boolean(useReducedMotion());
  const size = useSize();

  // Same feel as the text bands: scroll speed boosts the drift.
  const { scrollY } = useScroll();
  const scrollVelocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(scrollVelocity, [0, 1000], [0, 4], { clamp: false });

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Two strips of film with photos of friends, family and trips"
      className="relative h-[310px] overflow-hidden select-none [-webkit-touch-callout:none] [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)] md:h-[480px]"
    >
      {STRIPS.map((strip, i) => (
        <Strip key={i} strip={strip} size={size} boost={boost} running={inView && !reducedMotion} />
      ))}
    </div>
  );
}

function Strip({
  strip,
  size,
  boost,
  running,
}: {
  strip: StripConfig;
  size: Size;
  boost: MotionValue<number>;
  running: boolean;
}) {
  const { frames, width } = layout(strip.media, size, strip.firstFrame);
  const stripH = size.frameH + size.border * 2;

  // Start the second roll half a copy along, so the two don't mirror.
  const offset = useMotionValue(strip.direction === 1 ? -width / 2 : 0);
  const x = useTransform(offset, (v) => wrap(-width, 0, v));
  // Eases to 0 while hovered, so the strip comes to rest instead of snapping.
  const pace = useSpring(1, { stiffness: 90, damping: 22 });
  const heading = useRef<1 | -1>(1);

  useAnimationFrame((_, delta) => {
    if (!running) return;
    const b = boost.get();
    if (b < 0) heading.current = -1;
    else if (b > 0) heading.current = 1;
    const step = strip.direction * heading.current * size.speed * (1 + Math.abs(b)) * pace.get();
    offset.set(offset.get() + step * (Math.min(delta, 64) / 1000));
  });

  const textBand = size.border - size.perf.inset - size.perf.h;
  const textTop = size.perf.inset + size.perf.h + (textBand - size.font) / 2;
  const textBottom = size.border + size.frameH + (textBand - size.font) / 2;

  return (
    <div
      onPointerEnter={(e) => e.pointerType === "mouse" && pace.set(0)}
      onPointerLeave={() => pace.set(1)}
      className="absolute -left-[15%] w-[130%] overflow-hidden shadow-[0_16px_30px_-10px_rgba(0,0,0,0.5)]"
      style={{
        top: `calc(50% + ${strip.side * (stripH + SPREAD) / 2}px)`,
        height: stripH,
        transform: `translateY(-50%) rotate(${strip.rotate}deg)`,
      }}
    >
      {/* Near-black film; a warm brown in dark mode so it doesn't vanish into the page. */}
      <motion.div className="flex h-full w-max bg-[#16120f] dark:bg-[#2e2722]" style={{ x, ...perforationMask(size) }}>
        {Array.from({ length: COPIES }, (_, copy) => (
          <div key={copy} className="relative h-full shrink-0" style={{ width }}>
            {frames.map(({ media, x: left, w, number }, k) => (
              <div key={k}>
                <div
                  data-cursor-text={media.caption}
                  className="absolute overflow-hidden rounded-[3px] bg-[#2a241f]"
                  style={{ left, top: size.border, width: w, height: size.frameH }}
                >
                  <FrameMedia media={media} width={w} />
                  {/* A soft vignette, like light falling off at the corners. */}
                  <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_18px_rgba(0,0,0,0.45)]" />
                </div>
                <EdgeText left={left + 2} top={textTop} size={size}>
                  {k % 2 === 0 ? "TARUN 400" : "MOMENTS"}
                </EdgeText>
                <EdgeText left={left + 2} top={textBottom} size={size}>
                  ▸ {number}
                </EdgeText>
                <EdgeText left={left + w - 2} top={textBottom} size={size} alignEnd>
                  {number}A
                </EdgeText>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
      {/* Gloss across the frames; it stays put while the film slides under it. */}
      <div
        className="pointer-events-none absolute inset-x-0 bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.08)_46%,transparent_62%)]"
        style={{ top: size.border, height: size.frameH }}
      />
    </div>
  );
}

function EdgeText({
  children,
  left,
  top,
  size,
  alignEnd = false,
}: {
  children: React.ReactNode;
  left: number;
  top: number;
  size: Size;
  alignEnd?: boolean;
}) {
  return (
    <span
      className="pointer-events-none absolute font-mono leading-none tracking-[0.18em] whitespace-nowrap"
      style={{
        left,
        top,
        fontSize: size.font,
        color: EDGE_INK,
        transform: alignEnd ? "translateX(-100%)" : undefined,
      }}
    >
      {children}
    </span>
  );
}

function FrameMedia({ media, width }: { media: Media; width: number }) {
  if (media.kind === "video") return <LoopingClip src={media.src} poster={media.poster} />;
  return (
    <Image
      src={media.src}
      alt=""
      fill
      draggable={false}
      // Request only what the frame needs, so there's no big copy to grab.
      sizes={`${width}px`}
      className="pointer-events-none object-cover"
    />
  );
}

/** A silent loop that plays only while on screen, and not at all with reduced motion. */
function LoopingClip({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { margin: "100px" });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (inView && !reducedMotion) video.play().catch(() => {});
    else video.pause();
  }, [inView, reducedMotion]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload nofullscreen noremoteplayback"
      tabIndex={-1}
      className="pointer-events-none size-full object-cover"
    />
  );
}
