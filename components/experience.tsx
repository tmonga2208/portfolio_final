"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "@/components/reveal";
import { experienceData, type Experience } from "@/types/experience";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The company, shown as its wordmark when we have one and as type when we don't.
 * Either way the name stays in the DOM as a heading so the section still has a
 * readable outline for screen readers and search.
 */
function CompanyName({ role }: { role: Experience }) {
    const heading = role.logo ? (
        <>
            <Image
                src={role.logo.src}
                alt={role.company}
                width={role.logo.width}
                height={role.logo.height}
                className="h-10 w-auto"
                priority={false}
            />
            <span className="sr-only">{role.company}</span>
        </>
    ) : (
        <span className="text-3xl font-bold">{role.company}</span>
    );

    return (
        <h3 className="flex items-center gap-2">
            {role.url ? (
                <Link
                    href={role.url}
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

/** One role on the timeline: node + drawn-in rail on the left, content beside it. */
function TimelineRole({ role }: { role: Experience }) {
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
                    className="absolute bottom-0 top-3 w-px bg-[#043360]/30"
                />
                <span className="relative z-10 mt-1 size-3.5 rounded-full bg-[#043360]" />
            </div>

            <Reveal className="min-w-0 flex-1 pb-16 md:pb-20">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {role.period}
                    {role.location && (
                        <span className="text-muted-foreground/60"> · {role.location}</span>
                    )}
                </p>

                <div className="mt-5">
                    <CompanyName role={role} />
                </div>

                <p className="mt-2 text-xl italic text-[#043360]">{role.role}</p>

                {role.blurb && (
                    <p className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground/80">
                        {role.blurb}
                    </p>
                )}

                {role.highlights && role.highlights.length > 0 && (
                    <ul className="mt-6 flex max-w-3xl flex-col gap-3">
                        {role.highlights.map((item) => (
                            <li
                                key={item}
                                className="flex gap-3 text-lg leading-relaxed text-muted-foreground"
                            >
                                <span
                                    aria-hidden="true"
                                    className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-[#043360]"
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {role.stack && role.stack.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                        {role.stack.map((tech) => (
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
            {experienceData.map((role) => (
                <TimelineRole key={`${role.company}-${role.period}`} role={role} />
            ))}

            {/* Open end of the line — where the next role docks. */}
            <div className="flex items-center gap-6 md:gap-10">
                <div className="flex w-4 shrink-0 justify-center" aria-hidden="true">
                    <span className="size-3.5 rounded-full border-2 border-[#043360]/40 bg-background" />
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60">
                    The next chapter
                </p>
            </div>
        </div>
    );
}
