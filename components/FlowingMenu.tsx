"use client";

import { gsap } from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { MenuIcon, XIcon } from "lucide-react";
import { createPortal } from "react-dom";
import React, { useEffect, useState } from "react";
import { useIsClient } from "@/hooks/use-is-client";

interface MenuItemProps {
  link: string;
  text: string;
  image: string;
  onNavigate?: () => void;
}

interface FlowingMenuProps {
  items?: Omit<MenuItemProps, "onNavigate">[];
  className?: string;
}

/**
 * Full-screen menu: each row floods with a scrolling band of its label and a
 * photo, entering from whichever edge the pointer came in through.
 */
const FlowingMenu: React.FC<FlowingMenuProps> = ({ items = [], className = "" }) => {
  const [open, setOpen] = useState(false);
  // True only on the client, so the portal never renders during SSR.
  const mounted = useIsClient();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className={`block transition-colors hover:text-brand ${className}`}
      >
        <MenuIcon className="size-5" />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                exit={{ clipPath: "inset(0 0 100% 0)" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-[140] flex flex-col bg-[#060010] font-sans"
              >
                <div className="flex justify-end p-5">
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
                  >
                    <XIcon className="size-6" />
                  </button>
                </div>
                <nav className="flex flex-1 flex-col">
                  {items.map((item) => (
                    <MenuItem key={item.link} {...item} onNavigate={() => setOpen(false)} />
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({ link, text, image, onNavigate }) => {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const marqueeInnerRef = React.useRef<HTMLDivElement>(null);

  const animationDefaults = { duration: 0.6, ease: "expo" };

  const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number): "top" | "bottom" => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" })
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" })
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" });
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" })
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" });
  };

  const repeatedMarqueeContent = React.useMemo(
    () =>
      Array.from({ length: 4 }).map((_, idx) => (
        <React.Fragment key={idx}>
          <span className="p-[1vh_1vw_0] text-[4vh] font-normal uppercase leading-[1.2] text-[#060010]">{text}</span>
          <div
            className="mx-[2vw] my-[2em] h-[7vh] w-[200px] rounded-[50px] bg-cover bg-center p-[1em_0]"
            style={{ backgroundImage: `url(${image})` }}
          />
        </React.Fragment>
      )),
    [text, image]
  );

  return (
    <div className="relative flex-1 overflow-hidden text-center shadow-[0_-1px_0_0_#fff]" ref={itemRef}>
      <a
        className="relative flex h-full cursor-pointer items-center justify-center text-[4vh] font-semibold uppercase text-white no-underline hover:text-[#060010] focus:text-white focus-visible:text-[#060010]"
        href={link}
        onClick={onNavigate}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </a>
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-full translate-y-[101%] overflow-hidden bg-white"
        ref={marqueeRef}
      >
        <div className="flex h-full w-[200%]" ref={marqueeInnerRef}>
          <div className="relative flex h-full w-[200%] animate-marquee items-center will-change-transform">
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowingMenu;
