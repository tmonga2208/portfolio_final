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

/** Labels are 12px uppercase with wide tracking: about this many viewBox units a character. */
const LABEL_CHAR_WIDTH = 8.6;
const LABEL_GAP = 12;
const labelWidth = (text: string) => text.length * LABEL_CHAR_WIDTH;

/** Split a name at the space that best balances its two halves. */
function splitInTwo(name: string): string[] {
  const words = name.split(" ");
  let best: string[] = [name];
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const diff = Math.abs(a.length - b.length);
    if (diff < bestDiff) {
      best = [a, b];
      bestDiff = diff;
    }
  }
  return best;
}

/**
 * Where a pin's label goes: its preferred side on one line, else that side on
 * two lines, else the other side — so no label runs off the edge of the map.
 */
function placeLabel(name: string, x: number, preferLeft: boolean) {
  const room = { left: x - LABEL_GAP - 4, right: WIDTH - x - LABEL_GAP - 4 };
  const sides = preferLeft ? (["left", "right"] as const) : (["right", "left"] as const);
  const options = sides.flatMap((side) => [
    { side, lines: [name] },
    { side, lines: splitInTwo(name) },
  ]);
  return options.find(({ side, lines }) => Math.max(...lines.map(labelWidth)) <= room[side]) ?? options[0];
}
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
        const label = placeLabel(name, x, crowded);
        const labelX = label.side === "left" ? x - LABEL_GAP : x + LABEL_GAP;

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
              x={labelX}
              y={y + 4}
              textAnchor={label.side === "left" ? "end" : "start"}
              className={cn(
                "text-[12px] uppercase tracking-[0.12em] transition-colors",
                active ? "fill-brand font-semibold" : "fill-foreground"
              )}
            >
              {/* Two-line labels straddle the pin: first line up, second below. */}
              {label.lines.length === 1
                ? name
                : label.lines.map((line, i) => (
                    <tspan key={line} x={labelX} dy={i === 0 ? "-0.55em" : "1.1em"}>
                      {line}
                    </tspan>
                  ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
