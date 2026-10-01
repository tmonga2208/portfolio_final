"use client"

import Image from "next/image";
import { useIsClient } from "@/hooks/use-is-client";
import { books, type Book } from "@/types/library";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteNav } from "@/components/site-nav";
import { SectionHeading } from "@/components/section-heading";

function BookSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            <Skeleton className="aspect-2/3 w-full rounded-lg" />
            <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </div>
    );
}

function Cover({ book, sizes, className = "" }: { book: Book; sizes: string; className?: string }) {
    return book.coverUrl ? (
        <Image src={book.coverUrl} alt={book.title} fill className={`object-cover ${className}`} sizes={sizes} />
    ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-muted dark:to-secondary flex items-center justify-center">
            <div className="text-center p-6">
                <p className="font-bold text-lg mb-2 text-gray-700 dark:text-foreground">
                    {book.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">{book.author}</p>
            </div>
        </div>
    );
}

/** The book marked "reading", given pride of place above the shelf. */
function CurrentlyReading({ book }: { book: Book }) {
    return (
        <section className="mt-12 flex flex-col gap-6 rounded-2xl border border-border p-6 sm:flex-row sm:items-center sm:gap-8">
            <div className="relative aspect-2/3 w-28 shrink-0 overflow-hidden rounded-lg bg-muted shadow-md sm:w-32">
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

export default function LibraryPage() {
    const isLoading = !useIsClient();

    const totalRead = books.filter((b) => b.status === "read").length;
    const reading = books.find((b) => b.status === "reading");
    const shelf = books.filter((b) => b !== reading);

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

                {reading && <CurrentlyReading book={reading} />}

                {/* Books Grid */}
                <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {isLoading
                        ? Array.from({ length: 8 }).map((_, i) => (
                            <BookSkeleton key={i} />
                        ))
                        : shelf.map((book) => (
                            <div key={book.id} className="flex flex-col group">
                                {/* Book Cover */}
                                <div className="relative aspect-2/3 mb-3 overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300 bg-gray-100 dark:bg-muted">
                                    <Cover
                                        book={book}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>

                                {/* Book Info */}
                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-semibold text-lg mb-1 leading-tight line-clamp-2" title={book.title}>
                                        {book.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2 dark:text-muted-foreground">{book.author}</p>

                                    <div className="mt-auto flex items-center justify-between gap-2">
                                        {/* Status Badge */}
                                        {book.status ? (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span
                                                    className="text-xs px-2.5 py-1 rounded-full border bg-white border-gray-300 text-gray-700 dark:bg-card dark:border-border dark:text-foreground"
                                                >
                                                    {book.status}
                                                </span>
                                                {book.rating && (
                                                    <span className="text-xs text-gray-600 dark:text-muted-foreground">
                                                        {book.rating}/5
                                                    </span>
                                                )}
                                            </div>
                                        ) : <div />}

                                        {/* Buy Link */}
                                        {book.buyLink && (
                                            <a
                                                href={book.buyLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-brand hover:underline whitespace-nowrap"
                                            >
                                                Buy on Amazon
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </main>
        </>
    );
}
