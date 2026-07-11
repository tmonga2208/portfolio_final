"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import { books } from "@/types/library";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function LibraryPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    const totalRead = books.filter((b) => b.status === "read").length;
    const currentlyReading = books.filter((b) => b.status === "reading").length;

    return (
        <div className="hide-cursor min-h-screen bg-[#FBFBFB] font-crimson">
            <SmoothCursor />
            <div className="max-w-6xl mx-auto px-8 py-16">
                {/* Header Section */}
                <div className="mb-12" data-aos="fade-up">
                    <h1 className="text-6xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Library
                    </h1>
                    <p className="text-gray-600 text-xl mb-2">
                        Books I'm reading and have read lately.
                    </p>
                    <p className="text-gray-500 text-lg">
                        Total read: {totalRead}
                    </p>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {isLoading
                        ? Array.from({ length: 8 }).map((_, i) => (
                            <BookSkeleton key={i} />
                        ))
                        : books.map((book, index) => (
                            <div
                                key={book.id}
                                className="flex flex-col group"
                                data-aos="fade-up"
                                data-aos-delay={index * 50}
                            >
                                {/* Book Cover */}
                                <div className="relative aspect-2/3 mb-3 overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300 bg-gray-100">
                                    {book.coverUrl ? (
                                        <Image
                                            src={book.coverUrl}
                                            alt={book.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                            <div className="text-center p-6">
                                                <p className="font-bold text-lg mb-2 text-gray-700">
                                                    {book.title}
                                                </p>
                                                <p className="text-sm text-gray-600">{book.author}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Book Info */}
                                <div className="flex-1 flex flex-col">
                                    <h3 className="font-semibold text-lg mb-1 leading-tight line-clamp-2" title={book.title}>
                                        {book.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-2">{book.author}</p>

                                    <div className="mt-auto flex items-center justify-between gap-2">
                                        {/* Status Badge */}
                                        {book.status ? (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span
                                                    className={`text-xs px-2.5 py-1 rounded-full border ${book.status === "reading"
                                                        ? "bg-white border-gray-300 text-gray-700"
                                                        : book.status === "read"
                                                            ? "bg-white border-gray-300 text-gray-700"
                                                            : "bg-white border-gray-300 text-gray-700"
                                                        }`}
                                                >
                                                    {book.status}
                                                </span>
                                                {book.rating && (
                                                    <span className="text-xs text-gray-600">
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
                                                className="text-sm font-medium text-[#043360] hover:underline whitespace-nowrap"
                                            >
                                                Buy on Amazon
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}