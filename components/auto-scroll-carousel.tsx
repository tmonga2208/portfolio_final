"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface CarouselImage {
    src: string;
    alt: string;
}

interface AutoScrollCarouselProps {
    images: CarouselImage[];
}

export function AutoScrollCarousel({ images }: AutoScrollCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showArrows, setShowArrows] = useState(false);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let animationId: number;
        const scrollSpeed = 1; // pixels per frame

        const autoScroll = () => {
            if (!isHovered && scrollContainer) {
                scrollContainer.scrollLeft += scrollSpeed;

                // Reset to start when reaching the end for infinite loop
                if (
                    scrollContainer.scrollLeft >=
                    scrollContainer.scrollWidth - scrollContainer.clientWidth
                ) {
                    scrollContainer.scrollLeft = 0;
                }
            }
            animationId = requestAnimationFrame(autoScroll);
        };

        animationId = requestAnimationFrame(autoScroll);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [isHovered]);

    const scroll = (direction: "left" | "right") => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const scrollAmount = 400; // Width of one image
        const targetScroll =
            direction === "left"
                ? scrollContainer.scrollLeft - scrollAmount
                : scrollContainer.scrollLeft + scrollAmount;

        scrollContainer.scrollTo({
            left: targetScroll,
            behavior: "smooth",
        });
    };

    return (
        <div
            className="relative flex-1 min-w-0"
            onMouseEnter={() => {
                setIsHovered(true);
                setShowArrows(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                setShowArrows(false);
            }}
        >
            {/* Blur fade on right */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

            {/* Left Arrow */}
            {showArrows && (
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-background/80 hover:bg-background rounded-full transition-all border border-border shadow-lg"
                >
                    <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            )}

            {/* Right Arrow */}
            {showArrows && (
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-background/80 hover:bg-background rounded-full transition-all border border-border shadow-lg"
                >
                    <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            )}

            <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 pb-4">
                    {/* Render images twice for infinite scroll effect */}
                    {[...images, ...images].map((image, index) => (
                        <div
                            key={index}
                            className="relative aspect-video w-[400px] shrink-0 overflow-hidden rounded-xl border border-border"
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
