"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import type { MouseEvent, ReactNode } from "react";
import ClickSpark from "@/components/ClickSpark";
import { ScrollVelocity } from "@/components/ScrollVelocity";
import { openCommandPalette } from "@/components/command-palette";
import { TravelSection } from "@/components/travel-section";
import { NowPlayingBadge } from "@/components/now-playing";
import { Availability } from "@/components/availability";
import { NameWordmark } from "@/components/name-wordmark";
import { SwimWord } from "@/components/easter-eggs";
import { NowNote } from "@/components/now-note";
import { OnRepeat } from "@/components/on-repeat";
import { copyEmail, EMAIL } from "@/lib/contact";
import { SiteNav } from "@/components/site-nav";
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

/**
 * Hover underline for the contact headline. A background rather than the global
 * .link-underline (an inline-block), so the headline can wrap like normal text.
 */
const HEADLINE_UNDERLINE =
  "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_3px] bg-left-bottom bg-no-repeat box-decoration-clone transition-[background-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[length:100%_3px]";

/** Copy the address instead of assuming a mail app; fall back to mailto if the clipboard is blocked. */
async function handleContactClick(e: MouseEvent<HTMLAnchorElement>) {
  // Modified clicks (open in new tab, etc.) keep their normal behaviour.
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (!(await copyEmail())) window.location.href = `mailto:${EMAIL}`;
}

export default function Home() {
  return (
    <ThemedClickSpark>
      <SiteNav />

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
                  <SwimWord /> to clear my head,
                  and I try to read. Sometimes it works. Sometimes I just buy more{" "}
                  <Link href="/library" className="link-underline font-semibold italic text-brand">
                    books
                  </Link>
                  . Growth is a process.
                </p>
              </RevealItem>
            </RevealGroup>
          </div>
          <Reveal>
            <NowNote />
            <OnRepeat />
          </Reveal>
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

        {/* Scroll faster and the band speeds up with you. Two single-row bands so the
            second, running the other way, can be outlined in the accent colour. */}
        <div aria-hidden className="select-none pt-24 text-foreground/90 md:pt-32">
          <ScrollVelocity
            texts={["Frontend · Design Systems · Interfaces ·"]}
            velocity={40}
            className="px-4 font-crimson italic"
          />
          <ScrollVelocity
            texts={["React · TypeScript · Next.js · Figma ·"]}
            velocity={-40}
            className="px-4 font-crimson italic text-transparent [-webkit-text-stroke:1px_var(--brand)] md:[-webkit-text-stroke:1.5px_var(--brand)]"
          />
        </div>

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
                  className="group transition-colors hover:text-brand"
                >
                  <span className={HEADLINE_UNDERLINE}>Get in </span>
                  {/* Keep the arrow on the same line as "touch". */}
                  <span className="whitespace-nowrap">
                    <span className={HEADLINE_UNDERLINE}>touch</span>
                    <ArrowUpRight className="ml-1 inline size-12 align-baseline transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:-translate-y-2 md:size-20" />
                  </span>
                </Link>
                {/* One line only fits from xl up; below that "Let's talk." gets its own
                    line, without the dot that would otherwise start it. */}
                <span className="italic text-brand">
                  <span className="hidden xl:inline">. </span>
                  <span className="block xl:inline">Let&apos;s talk.</span>
                </span>
              </h2>
            </Magnetic>
          </Reveal>
          <Reveal>
            <Availability />
          </Reveal>
          <Reveal>
            <p className="mt-6 font-sans text-sm text-muted-foreground">
              {EMAIL} ·{" "}
              <a href={`mailto:${EMAIL}`} className="link-underline transition-colors hover:text-brand">
                open in your mail app
              </a>
            </p>
          </Reveal>
        </section>

        {/* The bottom padding keeps the last of the page clear of the player pill. */}
        <footer className="border-t border-border px-6 pb-28 pt-10 md:px-10">
          <div className="flex flex-col gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>© {new Date().getFullYear()} Tarun Monga</span>
            <NowPlayingBadge />
            <button
              type="button"
              onClick={openCommandPalette}
              className="text-left uppercase tracking-[0.2em] transition-colors hover:text-brand md:text-right"
            >
              <span className="pointer-coarse:hidden">Press ⌘K to explore</span>
              <span className="hidden pointer-coarse:inline">Tap to explore</span>
            </button>
          </div>
          {/* Bookends the hero. */}
          <div className="mt-16 md:mt-24">
            <NameWordmark placement="footer" />
          </div>
        </footer>
      </main>
    </ThemedClickSpark>
  );
}
