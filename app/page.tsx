"use client";

import { ArrowUpRight, Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ClickSpark from "@/components/ClickSpark";
import { AutoScrollCarousel } from "@/components/auto-scroll-carousel";
import { LinkPreview } from "@/components/ui/link-preview";
import { IOSFolder } from "@/components/ios-folder";
import { blogData } from "@/types/blog";
import { Hero } from "@/components/hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Magnetic } from "@/components/magnetic";
import { TechStack, Tools } from "@/components/tech-grid";
import { ExperienceList } from "@/components/experience";

type Entry = {
  title: string;
  url: string;
  period: string;
  blurb: string;
  images: { src: string; alt: string }[];
};

const WORK: Entry[] = [
  {
    title: "Chauhan Sports",
    url: "https://www.chauhansports.com",
    period: "August 2025 — Present",
    blurb:
      "Designed and developed the official website for Chauhan Sports, delivering a professional and brand-aligned digital presence. Led the complete brand identity process, including logo design, professional visiting cards, and visual guidelines. Built and managed the brand’s social media presence, creating a strong and consistent online identity across platforms.",
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
      "Designed and developed the official website for The Resolute Mind, delivering a professional, brand-aligned digital presence. Focused on clean visual design, intuitive user experience, and responsive layouts to ensure clarity, accessibility, and consistent performance across devices.",
    images: [
      { src: "/resolute/i1.png", alt: "The Resolute Mind - Screenshot 1" },
      { src: "/resolute/i4.png", alt: "The Resolute Mind - Screenshot 2" },
      { src: "/resolute/i3.png", alt: "The Resolute Mind - Screenshot 3" },
    ],
  },
];

const PROJECTS: Entry[] = [
  {
    title: "Forgestack",
    url: "https://forgestack.vercel.app/",
    period: "January 2025 — Present",
    blurb:
      "ForgeStack is a custom full-stack starter framework I designed and built to streamline modern web development. It provides a structured, scalable foundation with a guided CLI setup, opinionated best practices, and seamless integration of modern tools—helping developers move from setup to building real features faster.",
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
      "Watch videos with a floating window that stays on top of other applications, complete with playback controls and seamlessly integrated subtitles for a superior viewing experience.",
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

/** One work/project entry: meta column on the left, screenshots on the right. */
function EntryRow({ entry, number }: { entry: Entry; number: string }) {
  return (
    <Reveal>
      <article className="entry-row group flex flex-col gap-8 border-b border-border py-14 md:flex-row md:gap-12">
        <div className="flex shrink-0 flex-col justify-center md:w-[320px]">
          <span className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {number}
          </span>
          <div className="mb-3 flex items-center gap-2">
            <svg
              className="entry-icon size-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <LinkPreview url={entry.url} className="text-3xl font-bold">
              {entry.title}
            </LinkPreview>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">{entry.period}</p>
          <p className="text-lg leading-relaxed text-foreground/80">{entry.blurb}</p>
        </div>

        <div className="min-w-0 flex-1">
          <AutoScrollCarousel images={entry.images} />
        </div>
      </article>
    </Reveal>
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
          <div className="mt-8">
            {WORK.map((entry, i) => (
              <EntryRow key={entry.title} entry={entry} number={String(i + 1).padStart(2, "0")} />
            ))}
          </div>
        </section>

        {/* 04 — Projects */}
        <section className="px-6 pt-24 md:px-10 md:pt-32">
          <SectionHeading index="04 / Things I Built">Projects</SectionHeading>
          <div className="mt-8">
            {PROJECTS.map((entry, i) => (
              <EntryRow key={entry.title} entry={entry} number={String(i + 1).padStart(2, "0")} />
            ))}
          </div>
        </section>

        {/* 05 — Stack */}
        <section id="stack" className="scroll-mt-24 px-6 py-24 md:px-10 md:py-32">
          <SectionHeading index="05 / Tools of the Trade">Stack</SectionHeading>
          <div className="mt-14 flex flex-col gap-16">
            <Reveal>
              <TechStack />
            </Reveal>
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Also familiar with
              </p>
              <Reveal>
                <Tools />
              </Reveal>
            </div>
          </div>
        </section>

        {/* 06 — Beyond the code */}
        <section className="px-6 pb-24 md:px-10 md:pb-32">
          <SectionHeading index="06 / Beyond the Code">Travel</SectionHeading>
          <Reveal>
            <p className="mt-14 max-w-2xl text-2xl leading-snug text-muted-foreground">
              Some places I&apos;ve been. Open a folder.
            </p>
          </Reveal>
          <RevealGroup className="mt-10 flex flex-wrap gap-8">
            {blogData.map((blog) => (
              <RevealItem key={blog.id}>
                <IOSFolder blog={blog} />
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
