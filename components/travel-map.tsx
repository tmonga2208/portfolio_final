"use client";

import { motion } from "framer-motion";
import type { BlogContent } from "@/types/blog";
import { cn } from "@/lib/utils";

/*
 * A plain equirectangular chart rather than a drawn map: the trips sit on a
 * lat/long grid with no country outline, so there's no geography to get wrong
 * and no map library to ship. Longitude is squeezed by cos(24°) — the middle
 * of the range — so distances read roughly true.
 */
const BOUNDS = { west: 68, east: 84, north: 35, south: 13 };
const SCALE = 24;
const LNG_SQUEEZE = Math.cos((24 * Math.PI) / 180);
const WIDTH = (BOUNDS.east - BOUNDS.west) * LNG_SQUEEZE * SCALE;
const HEIGHT = (BOUNDS.north - BOUNDS.south) * SCALE;

const project = ({ lat, lng }: { lat: number; lng: number }) => ({
  x: (lng - BOUNDS.west) * LNG_SQUEEZE * SCALE,
  y: (BOUNDS.north - lat) * SCALE,
});

const LATS = [15, 20, 25, 30];
const LNGS = [70, 75, 80];

export function TravelMap({
  trips,
  activeId,
  onHover,
  onSelect,
}: {
  trips: BlogContent[];
  activeId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const pins = trips.map((trip) => ({ trip, ...project(trip.coords) }));

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full max-w-[340px] overflow-visible font-sans"
      role="group"
      aria-label="Map of trips"
    >
      <defs>
        <pattern id="travel-dots" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" className="fill-muted-foreground/20" />
        </pattern>
      </defs>

      <rect width={WIDTH} height={HEIGHT} rx="18" fill="url(#travel-dots)" />
      <rect width={WIDTH} height={HEIGHT} rx="18" className="fill-none stroke-border" />

      {LATS.map((lat) => {
        const { y } = project({ lat, lng: BOUNDS.west });
        return (
          <g key={`lat-${lat}`}>
            <line x1={0} x2={WIDTH} y1={y} y2={y} className="stroke-border" strokeDasharray="2 6" />
            <text x={8} y={y - 5} className="fill-muted-foreground text-[9px] tracking-widest">
              {lat}°N
            </text>
          </g>
        );
      })}
      {LNGS.map((lng) => {
        const { x } = project({ lat: BOUNDS.north, lng });
        return (
          <g key={`lng-${lng}`}>
            <line x1={x} x2={x} y1={0} y2={HEIGHT} className="stroke-border" strokeDasharray="2 6" />
            <text x={x + 4} y={HEIGHT - 8} className="fill-muted-foreground text-[9px] tracking-widest">
              {lng}°E
            </text>
          </g>
        );
      })}

      {pins.map(({ trip, x, y }) => {
        const active = trip.id === activeId;
        // Put the label on the left when another pin sits close by on the right,
        // so neighbouring labels don't run into each other.
        const crowded = pins.some((o) => o.trip.id !== trip.id && Math.abs(o.y - y) < 30 && o.x > x);
        const name = trip.location.split(",")[0];

        return (
          <g
            key={trip.id}
            role="button"
            tabIndex={0}
            aria-label={`Open ${trip.title}`}
            data-cursor-text={trip.title}
            onMouseEnter={() => onHover(trip.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(trip.id)}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(trip.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(trip.id);
              }
            }}
            className="cursor-pointer outline-none"
          >
            {/* Generous invisible hit area — the dot itself is tiny. */}
            <circle cx={x} cy={y} r={16} className="fill-transparent" />
            {active && (
              <motion.circle
                cx={x}
                cy={y}
                initial={{ r: 6, opacity: 0.6 }}
                animate={{ r: 22, opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                className="fill-brand"
              />
            )}
            {/* initial={false} renders the resting radius straight away; without it the
                first paint has no `r` and the browser logs an invalid-attribute error. */}
            <motion.circle
              cx={x}
              cy={y}
              initial={false}
              animate={{ r: active ? 7 : 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="fill-brand stroke-background"
              strokeWidth={2}
            />
            <text
              x={crowded ? x - 12 : x + 12}
              y={y + 4}
              textAnchor={crowded ? "end" : "start"}
              className={cn(
                "text-[12px] uppercase tracking-[0.12em] transition-colors",
                active ? "fill-brand font-semibold" : "fill-foreground"
              )}
            >
              {name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
