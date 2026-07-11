"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AnimatedArrow() {
    const pathRef = useRef<SVGPathElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const path = pathRef.current;
        const svg = svgRef.current;
        if (!path || !svg) return;

        const length = path.getTotalLength();

        // Draw bottom → top
        gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: -length,
        });

        gsap.to(path, {
            strokeDashoffset: 0,
            duration: 3,
            ease: "power1.inOut",
        });

        // Zig-zag + circular motion - once then settle
        gsap.to(svg, {
            x: 20,
            y: -20,
            duration: 1.2,
            ease: "sine.inOut",
        });

        gsap.to(svg, {
            rotation: 6,
            transformOrigin: "50% 50%",
            duration: 2,
            ease: "sine.inOut",
        });
    }, []);

    return (
        <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1728 1200"
            style={{ overflow: "visible" }}
        >
            <path
                ref={pathRef}
                d="M528.98 861.17c-24.23-33.59-37.55-76.63-28.93-117.15s42.05-76.53 83.18-81.43c26.42-3.15 52.52 6.01 78.29 12.65s54.48 10.49 77.89-2.17c9.15-4.95 17.22-12.63 20.66-22.45 7.04-20.14-6.78-41.81-5.26-63.09 1.1-15.32 10.33-29.26 22.46-38.67s26.96-14.73 41.91-18.25c17.69-4.16 36.37-6.16 52.05-15.33 23.67-13.85 42.63-41.93 53.12-67.27-20.17 1.76-53.97 6.78-77.46 9.67 23.74-2.92 61.78-11.31 80.86-10.24 4.11.23 14.67 52.44 17.78 55.15"
                fill="none"
                stroke="black"
                strokeWidth="20"
                strokeLinecap="round"
            />
        </svg>
    );
}