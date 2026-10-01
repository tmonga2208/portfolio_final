"use client";

import { Command, Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import FlowingMenu from "@/components/FlowingMenu";
import { ThemeToggle } from "@/components/theme-toggle";
import { openCommandPalette } from "@/components/command-palette";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/contact";

type NavItem = { label: string } & ({ section: string } | { href: string });

const NAV_ITEMS: NavItem[] = [
  { label: "Experience", section: "experience" },
  { label: "Work", section: "work" },
  { label: "Stack", section: "stack" },
  { label: "Library", href: "/library" },
  { label: "Contact", section: "contact" },
];

const MENU_ITEMS: (NavItem & { image: string })[] = [
  { label: "About", section: "about", image: "/img5.jpeg" },
  { label: "Experience", section: "experience", image: "/resolute/i1.png" },
  { label: "Work", section: "work", image: "/chauhan/image.png" },
  { label: "Projects", section: "projects", image: "/forge/i1.png" },
  { label: "Travel", section: "travel", image: "/travel/t1.JPG" },
  { label: "Gallery", section: "gallery", image: "/gallery/g05.jpg" },
  { label: "Library", href: "/library", image: "/img3.JPG" },
  { label: "Contact", section: "contact", image: "/img1.JPG" },
];

/** The site header, shared by the home page and the library. */
export function SiteNav() {
  const pathname = usePathname();
  // Sections are plain hashes on the home page; from anywhere else they route home first.
  const hrefFor = (item: NavItem) =>
    "href" in item ? item.href : pathname === "/" ? `#${item.section}` : `/#${item.section}`;

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Tarun <span className="text-brand">Monga</span>
        </Link>

        <nav className="hidden gap-8 text-sm uppercase tracking-[0.15em] md:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={hrefFor(item)} className="link-underline transition-colors hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Open command palette"
            data-cursor-text="Search everything"
            className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1 font-sans text-xs text-muted-foreground transition-colors hover:border-brand hover:text-brand md:flex"
          >
            <Command className="size-3.5" />K
          </button>
          <ThemeToggle />
          {[
            { href: GITHUB_URL, Icon: Github, label: "GitHub" },
            { href: LINKEDIN_URL, Icon: Linkedin, label: "LinkedIn" },
          ].map(({ href, Icon, label }) => (
            <motion.div
              key={label}
              whileHover={{ y: -3, scale: 1.12 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href={href} aria-label={label} className="block transition-colors hover:text-brand">
                <Icon className="size-5" />
              </Link>
            </motion.div>
          ))}
          <FlowingMenu
            items={MENU_ITEMS.map((item) => ({ link: hrefFor(item), text: item.label, image: item.image }))}
            className="md:hidden"
          />
        </div>
      </div>
    </motion.header>
  );
}
