"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { BlogContent } from "@/types/blog";
import { ScrollArea } from "@/components/ui/scroll-area";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Back-to-front: two photos peeking out behind, the cover on top. */
const CARD_POSES = [
  { rest: { rotate: -8, x: -14, y: 8 }, hover: { rotate: -16, x: -64, y: -4 } },
  { rest: { rotate: 6, x: 14, y: 2 }, hover: { rotate: 13, x: 56, y: -10 } },
  { rest: { rotate: -1, x: 0, y: -4 }, hover: { rotate: 1, x: 0, y: -26 } },
];

export function TravelPolaroid({ blog }: { blog: BlogContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock the page behind the overlay while it is open.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const photos = blog.thumbnails.slice(0, 3);

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.button
        type="button"
        layoutId={`trip-${blog.id}`}
        onClick={() => setIsOpen(true)}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap={{ scale: 0.97 }}
        aria-label={`Open ${blog.title}`}
        className="relative h-56 w-56 cursor-pointer md:h-64 md:w-64"
        data-cursor-text="Open"
      >
        {photos.map((src, i) => (
          <motion.div
            key={src}
            variants={CARD_POSES[i]}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute inset-0 m-auto h-fit w-40 rotate-0 rounded-sm border border-black/5 bg-white p-2 pb-8 shadow-[0_12px_30px_-12px_rgb(0_0_0/0.4)] md:w-44"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={src || "/placeholder.svg"}
                alt=""
                fill
                sizes="176px"
                className="object-cover"
              />
            </div>
          </motion.div>
        ))}
      </motion.button>

      <div className="text-center">
        <p className="text-xl font-semibold italic text-foreground">{blog.title}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {blog.location}
        </p>
      </div>

      {/*
       * Portalled to <body> on purpose. This overlay is `position: fixed`, and any
       * ancestor with a transform, filter, or will-change becomes its containing
       * block — which silently re-anchors it to that ancestor's box instead of the
       * viewport. The polaroids sit inside animated wrappers, so escaping the tree
       * makes it immune to whatever the page does above it.
       */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
              >
                <motion.div
                  initial={{ backdropFilter: "blur(0px)" }}
                  animate={{ backdropFilter: "blur(20px)" }}
                  exit={{ backdropFilter: "blur(0px)" }}
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsOpen(false)}
                />

                <motion.div
                  layoutId={`trip-${blog.id}`}
                  className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[40px] bg-background shadow-2xl"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="absolute right-6 top-6 z-10 rounded-full bg-black/10 p-2 backdrop-blur-md transition-colors hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <ScrollArea className="h-full w-full">
                    <div className="relative h-[40vh] min-h-[300px] w-full">
                      <Image
                        src={blog.heroImage || "/placeholder.svg"}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    </div>

                    <div className="mx-auto max-w-2xl px-6 py-12 md:px-12">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                          {blog.title}
                        </h1>
                        <div className="mb-12 flex flex-col gap-1">
                          <p className="text-lg font-medium text-muted-foreground">{blog.subtitle}</p>
                          <p className="text-sm font-medium uppercase tracking-wide text-primary/60">
                            {blog.location}
                          </p>
                        </div>

                        <div className="space-y-8">
                          {blog.sections.map((section, idx) => (
                            <div key={idx}>
                              {section.type === "text" ? (
                                <p className="font-serif text-lg leading-relaxed text-foreground/80">
                                  {section.content}
                                </p>
                              ) : (
                                <div className="relative my-8 aspect-video overflow-hidden rounded-3xl">
                                  <Image
                                    src={section.content || "/placeholder.svg"}
                                    alt=""
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </ScrollArea>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
