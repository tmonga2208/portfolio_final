"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "@/components/reveal";
import { experienceData, type Experience } from "@/types/experience";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The company, shown as its wordmark when we have one and as type when we don't.
 * Either way the name stays in the DOM as a heading so the section still has a
 * readable outline for screen readers and search.
 */
function CompanyName({ entry }: { entry: Experience }) {
    const heading = entry.logo ? (
        <>
            <Image
                src={entry.logo.src}
                alt={entry.company}
                width={entry.logo.width}
                height={entry.logo.height}
                className="h-10 w-auto dark:invert dark:hue-rotate-180"
                priority={false}
            />
            <span className="sr-only">{entry.company}</span>
        </>
    ) : (
        <span className="text-3xl font-bold">{entry.company}</span>
    );

    return (
        <h3 className="flex items-center gap-2">
            {entry.url ? (
                <Link
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition-opacity hover:opacity-70"
                >
                    {heading}
                </Link>
            ) : (
                heading
            )}
        </h3>
    );
}

/** One company on the timeline: node + drawn-in rail on the left, content beside it. */
function TimelineEntry({ entry }: { entry: Experience }) {
    return (
        <article className="relative flex gap-6 md:gap-10">
            {/* Rail: the node sits on a line that draws itself down the entry. */}
            <div className="relative flex w-4 shrink-0 justify-center" aria-hidden="true">
                <motion.span
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 1.2, ease: EASE }}
                    style={{ transformOrigin: "top" }}
                    className="absolute bottom-0 top-3 w-px bg-brand/30"
                />
                <span className="relative z-10 mt-1 size-3.5 rounded-full bg-brand" />
            </div>

            <Reveal className="min-w-0 flex-1 pb-16 md:pb-20">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {entry.period}
                    {entry.location && (
                        <span className="text-muted-foreground/60"> · {entry.location}</span>
                    )}
                </p>

                <div className="mt-5">
                    <CompanyName entry={entry} />
                </div>

                {entry.roles.length === 1 ? (
                    <p className="mt-2 text-xl italic text-brand">{entry.roles[0].title}</p>
                ) : (
                    // A progression at one company: newest role on top, each with its own dates.
                    <ol className="mt-4 flex flex-col gap-4 border-l border-brand/30 pl-5">
                        {entry.roles.map((role, i) => (
                            <li key={role.title} className="relative">
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "absolute -left-[1.6rem] top-[0.55em] size-2.5 rounded-full",
                                        i === 0 ? "bg-brand" : "border-2 border-brand/40 bg-background"
                                    )}
                                />
                                <p className={cn("text-xl italic", i === 0 ? "text-brand" : "text-muted-foreground")}>
                                    {role.title}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
                                    {role.period}
                                </p>
                            </li>
                        ))}
                    </ol>
                )}

                {entry.blurb && (
                    <p className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground/80">
                        {entry.blurb}
                    </p>
                )}

                {entry.highlights && entry.highlights.length > 0 && (
                    <ul className="mt-6 flex max-w-3xl flex-col gap-3">
                        {entry.highlights.map((item) => (
                            <li
                                key={item}
                                className="flex gap-3 text-lg leading-relaxed text-muted-foreground"
                            >
                                <span
                                    aria-hidden="true"
                                    className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand"
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {entry.stack && entry.stack.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                        {entry.stack.map((tech) => (
                            <li
                                key={tech}
                                className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.15em] text-muted-foreground"
                            >
                                {tech}
                            </li>
                        ))}
                    </ul>
                )}
            </Reveal>
        </article>
    );
}

export function ExperienceList() {
    return (
        <div className="mt-14">
            {experienceData.map((entry) => (
                <TimelineEntry key={`${entry.company}-${entry.period}`} entry={entry} />
            ))}

            {/* Open end of the line — where the next role docks. */}
            <div className="flex items-center gap-6 md:gap-10">
                <div className="flex w-4 shrink-0 justify-center" aria-hidden="true">
                    <span className="size-3.5 rounded-full border-2 border-brand/40 bg-background" />
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
                    The next chapter
                </p>
            </div>
        </div>
    );
}
