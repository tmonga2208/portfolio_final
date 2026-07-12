"use client";

import { ArrowUpRight, Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ClickSpark from "@/components/ClickSpark";
import { TravelPolaroid } from "@/components/travel-polaroid";
import { blogData } from "@/types/blog";
import { Hero } from "@/components/hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Magnetic } from "@/components/magnetic";
import { TechGrid } from "@/components/tech-grid";
import { ExperienceList } from "@/components/experience";
import { ShowcaseList, type ShowcaseEntry } from "@/components/showcase-list";

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
          Tarun <span className="text-[#043360]">Monga</span>
        </Link>

        <nav className="hidden gap-8 text-sm uppercase tracking-[0.15em] md:flex">
          <Link href="#experience" className="link-underline transition-colors hover:text-[#043360]">Experience</Link>
          <Link href="#work" className="link-underline transition-colors hover:text-[#043360]">Work</Link>
          <Link href="#stack" className="link-underline transition-colors hover:text-[#043360]">Stack</Link>
          <Link href="/library" className="link-underline transition-colors hover:text-[#043360]">Library</Link>
          <Link href="#contact" className="link-underline transition-colors hover:text-[#043360]">Contact</Link>
        </nav>

        <div className="flex gap-4">
          {[
            { href: "https://github.com/tmonga2208", Icon: Github, label: "GitHub" },
            { href: "https://www.linkedin.com/in/tarun-monga-b00008181/", Icon: Linkedin, label: "LinkedIn" },
          ].map(({ href, Icon, label }) => (
            <motion.div
              key={label}
              whileHover={{ y: -3, scale: 1.12 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href={href} aria-label={label} className="block transition-colors hover:text-[#043360]">
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
    <ClickSpark sparkColor="#043360" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
      <Nav />

      <main className="mx-auto max-w-[1600px] font-crimson">
        <Hero />

        {/* 01 — About */}
        <section className="px-6 py-24 md:px-10 md:py-32">
          <SectionHeading index="01 / About">About</SectionHeading>
          <div className="mt-14 grid gap-12 md:grid-cols-[1fr_1fr]">
            <Reveal>
              <p className="text-3xl leading-tight md:text-5xl">
                I&apos;m a <span className="italic text-[#043360]">software engineer</span> working
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
                  <span className="font-semibold italic text-[#043360]">swim</span> to clear my head,
                  and I try to read. Sometimes it works. Sometimes I just buy more{" "}
                  <Link href="/library" className="link-underline font-semibold italic text-[#043360]">
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
        <section className="px-6 pt-24 md:px-10 md:pt-32">
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
        <section className="px-6 pb-24 md:px-10 md:pb-32">
          <SectionHeading index="06 / Beyond the Code">Travel</SectionHeading>
          <Reveal>
            <p className="mt-14 max-w-2xl text-2xl leading-snug text-muted-foreground">
              Some places I&apos;ve been. Open a photo pile.
            </p>
          </Reveal>
          {/* Inset so the hover fan-out never clips at the viewport edge. */}
          <RevealGroup className="mt-14 flex flex-wrap gap-x-24 gap-y-16 px-6 md:px-16">
            {blogData.map((blog) => (
              <RevealItem key={blog.id}>
                <TravelPolaroid blog={blog} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* 07 — Contact */}
        <section id="contact" className="scroll-mt-24 border-t border-border px-6 py-24 md:px-10 md:py-32">
          <Reveal>
            <p className="mb-10 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              07 / Contact
            </p>
          </Reveal>
          <Reveal>
            <Magnetic strength={0.15}>
              <h2 className="text-6xl font-bold leading-[0.95] md:text-8xl">
                <Link
                  href="mailto:tarunmonga2208@gmail.com"
                  data-cursor-text="Say hello"
                  className="group inline-flex items-baseline transition-colors hover:text-[#043360]"
                >
                  <span className="link-underline">Get in touch</span>
                  <ArrowUpRight className="inline size-12 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-hover:-translate-y-2 md:size-20" />
                </Link>
                <span className="italic text-[#043360]">. Let&apos;s talk.</span>
              </h2>
            </Magnetic>
          </Reveal>
        </section>

        <footer className="flex flex-col gap-4 border-t border-border px-6 py-10 text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
          <span>© {new Date().getFullYear()} Tarun Monga</span>
          <span>Built with Next.js &amp; Three.js</span>
        </footer>
      </main>
    </ClickSpark>
  );
}
