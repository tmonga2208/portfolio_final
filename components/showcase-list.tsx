"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ShowcaseEntry = {
  title: string;
  url: string;
  period: string;
  blurb: string;
  tags: string[];
  images: { src: string; alt: string }[];
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Gap between the pointer and the floating preview. */
const PREVIEW_OFFSET = 28;

/**
 * Work rows carry more visual weight than personal projects: bigger titles,
 * taller rows, a larger floating preview.
 */
const VARIANTS = {
  work: {
    title: "text-4xl font-bold md:text-6xl lg:text-7xl",
    row: "py-10 md:py-12",
    previewWidth: 440,
  },
  project: {
    title: "text-3xl font-bold md:text-5xl",
    row: "py-7 md:py-9",
    previewWidth: 350,
  },
} as const;

export function ShowcaseList({
  entries,
  variant,
}: {
  entries: ShowcaseEntry[];
  variant: keyof typeof VARIANTS;
}) {
  const v = VARIANTS[variant];
  const [hovered, setHovered] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [canHover, setCanHover] = useState(false);
  const [lightbox, setLightbox] = useState<{ entry: number; image: number } | null>(null);

  // Touch devices fire synthetic mouse events on tap, which would flash the
  // floating preview under the finger — gate it on a real hover pointer.
  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const previewHeight = (v.previewWidth * 9) / 16;

  const place = useCallback(
    (px: number, py: number, jump = false) => {
      // Hang the preview to the pointer's right, flipping at the viewport edge.
      const flipX = px + PREVIEW_OFFSET + v.previewWidth > window.innerWidth - 16;
      const targetX = flipX ? px - PREVIEW_OFFSET - v.previewWidth : px + PREVIEW_OFFSET;
      const targetY = Math.min(
        Math.max(py - previewHeight / 2, 16),
        window.innerHeight - previewHeight - 16
      );
      x.set(targetX);
      y.set(targetY);
      if (jump) {
        springX.jump(targetX);
        springY.jump(targetY);
      }
    },
    [v.previewWidth, previewHeight, x, y, springX, springY]
  );

  // Cycle through the hovered entry's screenshots.
  useEffect(() => {
    if (hovered === null) return;
    setPreviewIdx(0);
    const id = setInterval(() => setPreviewIdx((p) => p + 1), 1400);
    return () => clearInterval(id);
  }, [hovered]);

  const showPreview = canHover && hovered !== null && expanded !== hovered;
  const hoveredEntry = hovered !== null ? entries[hovered] : null;

  return (
    <div
      className="border-t border-border"
      onMouseMove={(e) => place(e.clientX, e.clientY)}
      onMouseLeave={() => setHovered(null)}
    >
      {entries.map((entry, i) => {
        const isExpanded = expanded === i;
        return (
          <article key={entry.title} className="border-b border-border">
            <button
              type="button"
              onClick={() => setExpanded(isExpanded ? null : i)}
              onMouseEnter={(e) => {
                // Snap the spring onto the pointer when the preview first
                // appears, so it doesn't fly in from wherever it was parked.
                if (hovered === null) place(e.clientX, e.clientY, true);
                setHovered(i);
              }}
              aria-expanded={isExpanded}
              className={cn(
                "group flex w-full items-center gap-5 text-left transition-colors md:gap-10",
                v.row
              )}
            >
              <span
                className={cn(
                  "shrink-0 text-xs uppercase tracking-[0.25em] transition-colors duration-500",
                  isExpanded ? "text-[#043360]" : "text-muted-foreground group-hover:text-[#043360]"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3
                className={cn(
                  "min-w-0 flex-1 leading-[1.05] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:text-[#043360] md:group-hover:translate-x-4",
                  isExpanded && "text-[#043360]",
                  v.title
                )}
              >
                {entry.title}
              </h3>

              <span className="hidden shrink-0 text-sm text-muted-foreground md:block">
                {entry.period}
              </span>

              <Plus
                className={cn(
                  "size-6 shrink-0 text-muted-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-[#043360]",
                  isExpanded && "rotate-45 text-[#043360]"
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-8 pb-12 pt-2 md:grid-cols-[340px_1fr] md:gap-12">
                    <div className="flex flex-col gap-5">
                      <p className="text-sm text-muted-foreground md:hidden">{entry.period}</p>
                      <p className="text-lg leading-relaxed text-foreground/80">{entry.blurb}</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.15em] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline mt-auto inline-flex w-fit items-center gap-1 font-semibold text-[#043360]"
                      >
                        Visit site
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {entry.images.map((image, idx) => (
                        <button
                          key={image.src}
                          type="button"
                          onClick={() => setLightbox({ entry: i, image: idx })}
                          className={cn(
                            "media-frame relative aspect-video cursor-zoom-in overflow-hidden rounded-xl border border-border",
                            idx === 0 && "col-span-2"
                          )}
                        >
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        );
      })}

      {/* Floating screenshot preview that trails the cursor. */}
      <AnimatePresence>
        {showPreview && hoveredEntry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: EASE }}
            style={{ x: springX, y: springY, width: v.previewWidth }}
            className="pointer-events-none fixed left-0 top-0 z-50"
          >
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border shadow-[0_24px_60px_-20px_rgb(4_51_96/0.5)]">
              {hoveredEntry.images.map((image, idx) => (
                <Image
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={`${v.previewWidth}px`}
                  className={cn(
                    "object-cover transition-opacity duration-700",
                    idx === previewIdx % hoveredEntry.images.length ? "opacity-100" : "opacity-0"
                  )}
                />
              ))}
              <span className="absolute bottom-3 left-3 rounded-full bg-[#043360] px-3 py-1 text-xs font-medium text-white">
                Click to expand
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {lightbox && (
        <Lightbox
          images={entries[lightbox.entry].images}
          index={lightbox.image}
          onIndexChange={(image) => setLightbox({ ...lightbox, image })}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: { src: string; alt: string }[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const indexRef = useRef(index);
  indexRef.current = index;

  const step = useCallback(
    (dir: 1 | -1) => onIndexChange((indexRef.current + dir + images.length) % images.length),
    [images.length, onIndexChange]
  );

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, step]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 rounded-full border border-white/20 p-2 text-white transition-colors hover:bg-white/10"
      >
        <X className="size-6" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          step(-1);
        }}
        aria-label="Previous image"
        className="absolute left-3 z-10 rounded-full border border-white/20 p-2 text-white transition-colors hover:bg-white/10 md:left-8"
      >
        <ChevronLeft className="size-6" />
      </button>

      <motion.div
        key={images[index].src}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="relative aspect-video w-full max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index].src}
          alt={images[index].alt}
          fill
          sizes="100vw"
          className="rounded-lg object-contain"
          priority
        />
      </motion.div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          step(1);
        }}
        aria-label="Next image"
        className="absolute right-3 z-10 rounded-full border border-white/20 p-2 text-white transition-colors hover:bg-white/10 md:right-8"
      >
        <ChevronRight className="size-6" />
      </button>

      <span className="absolute bottom-5 text-sm tracking-[0.25em] text-white/70">
        {index + 1} / {images.length}
      </span>
    </motion.div>,
    document.body
  );
}
