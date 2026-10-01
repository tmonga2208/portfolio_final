"use client";

import { ArrowUpRight, Command, Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import type { MouseEvent, ReactNode } from "react";
import ClickSpark from "@/components/ClickSpark";
import { ThemeToggle } from "@/components/theme-toggle";
import { openCommandPalette } from "@/components/command-palette";
import { TravelSection } from "@/components/travel-section";
import { copyEmail, EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/contact";
import { Hero } from "@/components/hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Magnetic } from "@/components/magnetic";
import { TechGrid } from "@/components/tech-grid";
import { ExperienceList } from "@/components/experience";
import { ShowcaseList, type ShowcaseEntry } from "@/components/showcase-list";
import { GalleryMarquee } from "@/components/gallery-marquee";

const WORK: ShowcaseEntry[] = [
  {
    title: "Chauhan Sports",
    url: "https://www.chauhansports.com",
    period: "August 2025 — Present",
    blurb:
      "Complete brand build for a sports retailer — website, logo, visiting cards, and a consistent identity across social platforms.",
    tags: ["Web Design", "Branding", "Logo Design", "Social Media"],
    images: [
      { src: "/chauhan/image.png", alt: "Chauhan Sports - Screenshot 1" },
      { src: "/chauhan/img2.png", alt: "Chauhan Sports - Screenshot 2" },
      { src: "/chauhan/img3.png", alt: "Chauhan Sports - Screenshot 3" },
    ],
  },
  {
    title: "The Resolute Mind",
    url: "https://www.theresolutemind.in",
    period: "January 2025 — Present",
    blurb:
      "Official website with clean visual design and an intuitive, responsive experience that stays consistent across devices.",
    tags: ["Web Design", "UI/UX", "Responsive"],
    images: [
      { src: "/resolute/i1.png", alt: "The Resolute Mind - Screenshot 1" },
      { src: "/resolute/i4.png", alt: "The Resolute Mind - Screenshot 2" },
      { src: "/resolute/i3.png", alt: "The Resolute Mind - Screenshot 3" },
    ],
  },
];

const PROJECTS: ShowcaseEntry[] = [
  {
    title: "Forgestack",
    url: "https://forgestack.vercel.app/",
    period: "January 2025 — Present",
    blurb:
      "A full-stack starter framework with a guided CLI and opinionated defaults — from empty folder to real features, faster.",
    tags: ["TypeScript", "CLI", "Full-stack", "Open Source"],
    images: [
      { src: "/forge/i1.png", alt: "Forgestack - Screenshot 1" },
      { src: "/forge/i2.png", alt: "Forgestack - Screenshot 2" },
      { src: "/forge/i3.png", alt: "Forgestack - Screenshot 3" },
    ],
  },
  {
    title: "SubPIP",
    url: "https://subpip.vercel.app/",
    period: "January 2025",
    blurb:
      "A floating always-on-top video player with playback controls and seamlessly integrated subtitles.",
    tags: ["React", "Picture-in-Picture", "Subtitles"],
    images: [
      { src: "/subpip/i1.png", alt: "SubPIP - Screenshot 1" },
      { src: "/subpip/i2.png", alt: "SubPIP - Screenshot 2" },
      { src: "/subpip/i3.png", alt: "SubPIP - Screenshot 3" },
    ],
  },
];

/** ClickSpark draws on a canvas, so it needs the brand colour as a literal. */
function ThemedClickSpark({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <ClickSpark
      sparkColor={resolvedTheme === "dark" ? "#7fb2e5" : "#043360"}
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      {children}
    </ClickSpark>
  );
}

/** Copy the address instead of assuming a mail app; fall back to mailto if the clipboard is blocked. */
async function handleContactClick(e: MouseEvent<HTMLAnchorElement>) {
  // Modified clicks (open in new tab, etc.) keep their normal behaviour.
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (!(await copyEmail())) window.location.href = `mailto:${EMAIL}`;
}

function Nav() {
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
          <Link href="#experience" className="link-underline transition-colors hover:text-brand">Experience</Link>
          <Link href="#work" className="link-underline transition-colors hover:text-brand">Work</Link>
          <Link href="#stack" className="link-underline transition-colors hover:text-brand">Stack</Link>
          <Link href="/library" className="link-underline transition-colors hover:text-brand">Library</Link>
          <Link href="#contact" className="link-underline transition-colors hover:text-brand">Contact</Link>
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
        </div>
      </div>
    </motion.header>
  );
}

export default function Home() {
  return (
    <ThemedClickSpark>
      <Nav />

      <main className="mx-auto max-w-[1600px] font-crimson">
        <Hero />

        {/* 01 — About */}
        <section id="about" className="scroll-mt-24 px-6 py-24 md:px-10 md:py-32">
          <SectionHeading index="01 / About">About</SectionHeading>
          <div className="mt-14 grid gap-12 md:grid-cols-[1fr_1fr]">
            <Reveal>
              <p className="text-3xl leading-tight md:text-5xl">
                I&apos;m a <span className="italic text-brand">software engineer</span> working
                across frontend and design systems — building interfaces that stay clear under
                pressure.
              </p>
            </Reveal>
            <RevealGroup className="flex flex-col gap-6 text-xl text-muted-foreground md:pt-4">
              <RevealItem>
                <p>
                  Primarily React, TypeScript, Vite and Tailwind, with Figma alongside. I care about
                  the parts most people never see: the type scale, the spacing rhythm, the state you
                  forgot to design for.
                </p>
              </RevealItem>
              <RevealItem>
                <p>
                  Outside of code I{" "}
                  <span className="font-semibold italic text-brand" data-cursor-text="psst — type it">swim</span> to clear my head,
                  and I try to read. Sometimes it works. Sometimes I just buy more{" "}
                  <Link href="/library" className="link-underline font-semibold italic text-brand">
                    books
                  </Link>
                  . Growth is a process.
                </p>
              </RevealItem>
            </RevealGroup>
          </div>
        </section>

        {/* 02 — Experience */}
        <section id="experience" className="scroll-mt-24 px-6 md:px-10">
          <SectionHeading index="02 / Where I've Worked">Experience</SectionHeading>
          <ExperienceList />
        </section>

        {/* 03 — Work */}
        <section id="work" className="scroll-mt-24 px-6 pt-24 md:px-10 md:pt-32">
          <SectionHeading index="03 / Selected Work">Work</SectionHeading>
          <Reveal className="mt-12">
            <ShowcaseList entries={WORK} variant="work" />
          </Reveal>
        </section>

        {/* 04 — Projects */}
        <section id="projects" className="scroll-mt-24 px-6 pt-24 md:px-10 md:pt-32">
          <SectionHeading index="04 / Things I Built">Projects</SectionHeading>
          <Reveal className="mt-12">
            <ShowcaseList entries={PROJECTS} variant="project" />
          </Reveal>
        </section>

        {/* 05 — Stack */}
        <section id="stack" className="scroll-mt-24 px-6 py-24 md:px-10 md:py-32">
          <SectionHeading index="05 / Tools of the Trade">Stack</SectionHeading>
          <Reveal className="mt-14">
            <TechGrid />
          </Reveal>
        </section>

        {/* 06 — Beyond the code */}
        <section id="travel" className="scroll-mt-24 px-6 pb-24 md:px-10 md:pb-32">
          <SectionHeading index="06 / Beyond the Code">Travel</SectionHeading>
          <Reveal>
            <p className="mt-14 max-w-2xl text-2xl leading-snug text-muted-foreground">
              Some places I&apos;ve been. Pick a pin, or open a photo pile.
            </p>
          </Reveal>
          <TravelSection />
        </section>

        {/* 07 — Gallery */}
        <section id="gallery" className="scroll-mt-24 pb-24 md:pb-32">
          <div className="px-6 md:px-10">
            <SectionHeading index="07 / Moments">My Gallery</SectionHeading>
          </div>
          <Reveal className="mt-14">
            <GalleryMarquee />
          </Reveal>
        </section>

        {/* 08 — Contact */}
        <section id="contact" className="scroll-mt-24 border-t border-border px-6 py-24 md:px-10 md:py-32">
          <Reveal>
            <p className="mb-10 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              08 / Contact
            </p>
          </Reveal>
          <Reveal>
            <Magnetic strength={0.15}>
              <h2 className="text-6xl font-bold leading-[0.95] md:text-8xl">
                <Link
                  href={`mailto:${EMAIL}`}
                  onClick={handleContactClick}
                  data-cursor-text="Click to copy my email"
                  className="group inline-flex items-baseline transition-colors hover:text-brand"
                >
                  <span className="link-underline">Get in touch</span>
                  <ArrowUpRight className="inline size-12 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:-translate-y-2 md:size-20" />
                </Link>
                <span className="italic text-brand">. Let&apos;s talk.</span>
              </h2>
            </Magnetic>
          </Reveal>
          <Reveal>
            <p className="mt-10 font-sans text-sm text-muted-foreground">
              {EMAIL} ·{" "}
              <a href={`mailto:${EMAIL}`} className="link-underline transition-colors hover:text-brand">
                open in your mail app
              </a>
            </p>
          </Reveal>
        </section>

        <footer className="flex flex-col gap-4 border-t border-border px-6 py-10 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
          <span>© {new Date().getFullYear()} Tarun Monga</span>
          <span>Built with Next.js &amp; Three.js</span>
          <button
            type="button"
            onClick={openCommandPalette}
            className="text-left uppercase tracking-[0.2em] transition-colors hover:text-brand md:text-right"
          >
            Press ⌘K to explore
          </button>
        </footer>
      </main>
    </ThemedClickSpark>
  );
}
