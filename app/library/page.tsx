"use client"

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { books, type Book } from "@/types/library";
import { SiteNav } from "@/components/site-nav";
import { SectionHeading } from "@/components/section-heading";

/** Shelves this short share a row with a neighbour on wide screens. */
const HALF_SHELF_MAX = 3;

interface Shelf {
    name: string;
    books: Book[];
}

/** Groups books into one shelf per series, in the order the series first appear. */
function toShelves(list: Book[]): Shelf[] {
    const shelves = new Map<string, Book[]>();
    for (const book of list) {
        const name = book.series ?? "Standalones";
        shelves.set(name, [...(shelves.get(name) ?? []), book]);
    }
    return Array.from(shelves, ([name, books]) => ({ name, books }));
}

/**
 * A book cover. The title is typeset underneath, so a cover that is slow to
 * arrive or never does (Open Library goes down often) still reads as a book.
 */
function Cover({ book, sizes }: { book: Book; sizes: string }) {
    const [failed, setFailed] = useState(false);

    return (
        <>
            {/* Navy in both themes: the light-mode brand, which also sits well on black. */}
            <div className="absolute inset-0 flex flex-col justify-between bg-[#043360] p-2.5 text-[#faf9f6] sm:p-3">
                <p className="line-clamp-5 text-xs font-bold leading-tight break-words sm:text-sm">{book.title}</p>
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.15em] opacity-75">{book.author}</p>
            </div>
            {book.coverUrl && !failed && (
                <Image
                    src={book.coverUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes={sizes}
                    onError={() => setFailed(true)}
                />
            )}
            {/* The crease where the cover meets the spine. */}
            <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/25 via-white/15 to-transparent"
            />
        </>
    );
}

/** The plank the books stand on, with the shadow it throws on the wall. */
function Plank() {
    return (
        <div aria-hidden>
            <div className="h-[3px] rounded-full bg-foreground/20" />
            <div className="h-3 bg-gradient-to-b from-foreground/[0.07] to-transparent" />
        </div>
    );
}

/** The book marked "reading", given pride of place above the shelves. */
function CurrentlyReading({ book }: { book: Book }) {
    return (
        <section className="flex flex-col gap-6 rounded-2xl border border-border p-6 sm:flex-row sm:items-center sm:gap-8 md:p-8">
            <div className="relative aspect-2/3 w-28 shrink-0 overflow-hidden rounded-r-md rounded-l-sm bg-muted shadow-lg sm:w-32">
                <Cover book={book} sizes="128px" />
            </div>
            <div>
                <p className="flex items-center gap-2.5 font-sans text-xs uppercase tracking-[0.25em] text-brand">
                    <span aria-hidden className="relative flex size-2">
                        <span className="absolute inline-flex size-full rounded-full bg-brand opacity-60 motion-safe:animate-ping" />
                        <span className="relative inline-flex size-2 rounded-full bg-brand" />
                    </span>
                    Currently reading
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">{book.title}</h2>
                <p className="mt-1 text-lg text-muted-foreground">{book.author}</p>
                {book.buyLink && (
                    <a
                        href={book.buyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline mt-4 text-sm font-medium text-brand"
                    >
                        Buy on Amazon
                    </a>
                )}
            </div>
        </section>
    );
}

/**
 * One book standing on a shelf. Hover or focus lifts it off the plank and
 * writes its title in the strip under the shelf, while its neighbours dim.
 */
function ShelfBook({ book }: { book: Book }) {
    const cover = (
        <div className="relative aspect-2/3 w-24 overflow-hidden rounded-r-md rounded-l-sm bg-muted shadow-md transition-[translate,opacity,box-shadow] duration-300 ease-out group-hover/book:-translate-y-3 group-hover/book:shadow-xl group-focus-visible/book:-translate-y-3 group-focus-visible/book:shadow-xl group-has-[.book:hover]/shelf:opacity-50 group-hover/book:opacity-100! motion-reduce:transition-none sm:w-28 md:w-32">
            <Cover book={book} sizes="128px" />
        </div>
    );
    // Positioned against the shelf, not the book, so every title lands in the same spot.
    const caption = (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex h-8 items-center gap-2 opacity-0 transition-opacity duration-200 group-hover/book:opacity-100 group-focus-visible/book:opacity-100">
            <span className="truncate text-lg italic">{book.title}</span>
            {book.status === "chose not to finish" && (
                <span className="shrink-0 font-sans text-xs text-muted-foreground">Didn&apos;t finish</span>
            )}
            {book.buyLink && (
                <span className="flex shrink-0 items-center gap-1 font-sans text-xs text-brand">
                    Buy on Amazon
                    <ArrowUpRight aria-hidden className="size-3.5" />
                </span>
            )}
        </span>
    );

    return (
        <li className="shrink-0 snap-start">
            {book.buyLink ? (
                <a
                    href={book.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${book.title} by ${book.author}, buy on Amazon`}
                    className="book group/book block outline-none"
                >
                    {cover}
                    {caption}
                </a>
            ) : (
                <div className="book group/book">
                    {cover}
                    {caption}
                </div>
            )}
        </li>
    );
}

function SeriesShelf({ shelf }: { shelf: Shelf }) {
    const authors = Array.from(new Set(shelf.books.map((b) => b.author))).join(", ");
    const count = shelf.books.length;
    const half = count <= HALF_SHELF_MAX;

    return (
        <section
            className={`group/shelf relative min-w-0 self-end pb-9 ${half ? "" : "lg:col-span-2"}`}
        >
            <div className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 ${half ? "lg:flex-col" : ""}`}>
                <h2 className="text-2xl font-bold leading-tight md:text-3xl">{shelf.name}</h2>
                <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {authors} · {count} {count === 1 ? "book" : "books"}
                </p>
            </div>
            {/* Long series scroll sideways on small screens rather than wrapping off the plank. */}
            <div className="scrollbar-hide -mx-6 snap-x scroll-px-6 overflow-x-auto px-6 md:-mx-8 md:scroll-px-8 md:px-8">
                <ul className="flex w-max items-end gap-4 pt-6 md:gap-5">
                    {shelf.books.map((book) => (
                        <ShelfBook key={book.id} book={book} />
                    ))}
                </ul>
            </div>
            <Plank />
        </section>
    );
}

export default function LibraryPage() {
    const totalRead = books.filter((b) => b.status === "read").length;
    const reading = books.filter((b) => b.status === "reading");
    const shelves = toShelves(books.filter((b) => b.status !== "reading"));

    return (
        <>
            <SiteNav />
            <main className="mx-auto max-w-6xl px-6 pb-24 pt-32 font-crimson md:px-8">
                <SectionHeading as="h1" index={`Shelf / ${totalRead} read`}>
                    Library
                </SectionHeading>
                <p className="mt-6 max-w-2xl text-xl text-muted-foreground">
                    Books I&apos;m reading and have read lately.
                </p>

                <div className="mt-12 flex flex-col gap-4">
                    {reading.map((book) => (
                        <CurrentlyReading key={book.id} book={book} />
                    ))}
                </div>

                <div className="mt-16 grid gap-x-12 gap-y-10 lg:grid-cols-2">
                    {shelves.map((shelf) => (
                        <SeriesShelf key={shelf.name} shelf={shelf} />
                    ))}
                </div>
            </main>
        </>
    );
}
