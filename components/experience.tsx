"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { experienceData, type Experience } from "@/types/experience";

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
        <>
            <svg
                className="entry-icon size-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
            >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span className="text-3xl font-bold">{role.company}</span>
        </>
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

/**
 * One role: period pinned to the left column, everything else in the body —
 * same two-column rhythm as the work and project rows.
 */
function ExperienceRow({ role }: { role: Experience }) {
    return (
        <Reveal>
            <article className="entry-row flex flex-col gap-6 border-b border-border py-12 md:flex-row md:gap-12">
                <div className="flex shrink-0 flex-col gap-2 md:w-[320px]">
                    <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        {role.period}
                    </span>
                    {role.location && (
                        <span className="text-sm text-muted-foreground/70">{role.location}</span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                        <CompanyName role={role} />
                    </div>

                    <p className="text-xl italic text-[#043360]">{role.role}</p>

                    {role.blurb && (
                        <p className="mt-5 text-lg leading-relaxed text-foreground/80">{role.blurb}</p>
                    )}

                    {role.highlights && role.highlights.length > 0 && (
                        <ul className="mt-6 flex flex-col gap-3">
                            {role.highlights.map((item) => (
                                <li
                                    key={item}
                                    className="flex gap-3 text-lg leading-relaxed text-muted-foreground"
                                >
                                    <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-[#043360]" />
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
                </div>
            </article>
        </Reveal>
    );
}

export function ExperienceList() {
    return (
        <div className="mt-8">
            {experienceData.map((role) => (
                <ExperienceRow key={`${role.company}-${role.period}`} role={role} />
            ))}
        </div>
    );
}
