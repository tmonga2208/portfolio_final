"use client";

import { motion } from "framer-motion";
import type { Trip } from "@/types/travel";
import { ALSO_VISITED, HOME, NOW } from "@/types/places";

type Coords = { lat: number; lng: number };
type Point = { x: number; y: number };

/*
 * A plain equirectangular chart rather than a drawn map: the places sit on a
 * lat/long grid with no country outline, so there's no geography to get wrong
 * and no map library to ship. Longitude is squeezed by cos(24°) — the middle
 * of the range — so distances read roughly true.
 *
 * Trip pins carry a small place name, so the chart reads on touch screens too;
 * everything else is named by the site's cursor label on hover
 * (data-cursor-text).
 */
const BOUNDS = { west: 69, east: 87, north: 35, south: 13 };
const SCALE = 24;
const LNG_SQUEEZE = Math.cos((24 * Math.PI) / 180);
const WIDTH = (BOUNDS.east - BOUNDS.west) * LNG_SQUEEZE * SCALE;
const HEIGHT = (BOUNDS.north - BOUNDS.south) * SCALE;

const project = ({ lat, lng }: Coords): Point => ({
  x: (lng - BOUNDS.west) * LNG_SQUEEZE * SCALE,
  y: (BOUNDS.north - lat) * SCALE,
});

/*
 * Most places crowd into the hills of the north, a patch a few dots wide at
 * this scale. So that patch is drawn again, magnified, in the empty middle of
 * the chart — a cartographer's inset, tied to its outline by two zoom lines.
 * Places inside it are interactive in the inset; the chart keeps faint dots
 * there so the overall spread still reads.
 */
const NORTH = { west: 74.2, east: 79.6, north: 33.5, south: 29.6 };
const INSET_SCALE = 46;
const INSET_W = (NORTH.east - NORTH.west) * LNG_SQUEEZE * INSET_SCALE;
const INSET_H = (NORTH.north - NORTH.south) * INSET_SCALE;
const INSET = { x: WIDTH - INSET_W - 10, y: 150, w: INSET_W, h: INSET_H };

const inNorth = ({ lat, lng }: Coords) =>
  lat <= NORTH.north && lat >= NORTH.south && lng >= NORTH.west && lng <= NORTH.east;

const projectInset = ({ lat, lng }: Coords): Point => ({
  x: INSET.x + (lng - NORTH.west) * LNG_SQUEEZE * INSET_SCALE,
  y: INSET.y + (NORTH.north - lat) * INSET_SCALE,
});

/** Where a place is drawn interactively: in the inset if it's in the north. */
const place = (coords: Coords) => (inNorth(coords) ? projectInset(coords) : project(coords));

/** A gentle arc from a to b, bowed to one side, for the route from home. */
const arc = (a: Point, b: Point) => {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const bow = 0.22;
  return `M ${a.x} ${a.y} Q ${mx - (b.y - a.y) * bow} ${my + (b.x - a.x) * bow} ${b.x} ${b.y}`;
};

/** Which side of its pin a label sits, so labels stay inside the inset and off each other. */
const labelSide = (point: Point, trip: Trip): "left" | "right" =>
  trip.mapLabelSide ?? (point.x > INSET.x + INSET.w * 0.6 ? "left" : "right");

const LATS = [15, 20, 25, 30];
const LNGS = [70, 75, 80, 85];

export function TravelMap({
  trips,
  activeId,
  onHover,
  onSelect,
}: {
  trips: Trip[];
  activeId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const pins = trips.map((trip) => ({ trip, ...place(trip.coords) }));
  const visited = ALSO_VISITED.map((spot) => ({ spot, ...place(spot.coords) }));
  const home = place(HOME.coords);
  const now = place(NOW.coords);

  // The patch's outline on the chart, and faint dots for what's inside it.
  const box = { ...project({ lat: NORTH.north, lng: NORTH.west }) };
  const boxEnd = project({ lat: NORTH.south, lng: NORTH.east });
  const northDots = [HOME.coords, ...trips.map((t) => t.coords), ...ALSO_VISITED.map((v) => v.coords)]
    .filter(inNorth)
    .map(project);

  const active = pins.find((pin) => pin.trip.slug === activeId);
  // The route starts from home wherever the trip is drawn: the inset for the
  // north, the chart for anywhere else.
  const routeFrom = active && inNorth(active.trip.coords) ? home : project(HOME.coords);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full max-w-[380px] overflow-visible font-sans"
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

      {/* The north on the chart: an outline, faint dots, and zoom lines to the inset. */}
      <g aria-hidden>
        {northDots.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2} className="fill-brand/40" />
        ))}
        <rect
          x={box.x}
          y={box.y}
          width={boxEnd.x - box.x}
          height={boxEnd.y - box.y}
          rx={6}
          className="fill-none stroke-muted-foreground/50"
          strokeDasharray="3 3"
        />
        <line x1={box.x} y1={boxEnd.y} x2={INSET.x} y2={INSET.y} className="stroke-muted-foreground/40" strokeDasharray="3 3" />
        <line x1={boxEnd.x} y1={boxEnd.y} x2={INSET.x + INSET.w} y2={INSET.y} className="stroke-muted-foreground/40" strokeDasharray="3 3" />
      </g>

      <rect x={INSET.x} y={INSET.y} width={INSET.w} height={INSET.h} rx={10} className="fill-background" />
      <rect x={INSET.x} y={INSET.y} width={INSET.w} height={INSET.h} rx={10} fill="url(#travel-dots)" />
      <rect x={INSET.x} y={INSET.y} width={INSET.w} height={INSET.h} rx={10} className="fill-none stroke-border" />
      <text x={INSET.x + 10} y={INSET.y + 16} className="fill-muted-foreground text-[8px] tracking-[0.2em]" aria-hidden>
        THE NORTH ×2
      </text>

      {/* Home to the hovered trip. */}
      {active && (
        <motion.path
          key={active.trip.slug}
          d={arc(routeFrom, active)}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fill-none stroke-brand/70"
          strokeWidth={1.5}
          strokeLinecap="round"
          aria-hidden
        />
      )}

      {/* Been there, no story: small dots, named by the cursor label on hover. */}
      {visited.map(({ spot, x, y }) => (
        <g key={spot.name} data-marker="visited" data-cursor-text={spot.name} aria-hidden>
          <circle cx={x} cy={y} r={10} className="fill-transparent" />
          <circle data-dot cx={x} cy={y} r={3.5} className="fill-brand/55" />
        </g>
      ))}

      <g data-marker="home" data-cursor-text="Home · Ludhiana, Punjab">
        <circle cx={home.x} cy={home.y} r={12} className="fill-transparent" />
        <path
          data-dot
          d={`M ${home.x - 6} ${home.y + 5} V ${home.y - 1} L ${home.x} ${home.y - 6.5} L ${home.x + 6} ${home.y - 1} V ${home.y + 5} Z`}
          className="fill-brand stroke-background"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </g>

      <g data-marker="now" data-cursor-text="Pune · working here now">
        <circle cx={now.x} cy={now.y} r={12} className="fill-transparent" />
        <circle
          data-pulse
          cx={now.x}
          cy={now.y}
          r={6}
          className="origin-center fill-emerald-500/50 [transform-box:fill-box] motion-safe:animate-ping"
        />
        <circle data-dot cx={now.x} cy={now.y} r={5} className="fill-emerald-500 stroke-background" strokeWidth={2} />
      </g>

      {pins.map(({ trip, x, y }) => {
        const isActive = trip.slug === activeId;
        const side = labelSide({ x, y }, trip);
        return (
          <g
            key={trip.slug}
            role="button"
            tabIndex={0}
            aria-label={`Open ${trip.title}`}
            data-marker="trip"
            data-cursor-text={trip.title}
            onMouseEnter={() => onHover(trip.slug)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(trip.slug)}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(trip.slug)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(trip.slug);
              }
            }}
            className="cursor-pointer outline-none"
          >
            {/* Generous invisible hit area — the dot itself is tiny. */}
            <circle cx={x} cy={y} r={16} className="fill-transparent" />
            {isActive && (
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
              data-dot
              cx={x}
              cy={y}
              initial={false}
              animate={{ r: isActive ? 7 : 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="fill-brand stroke-background"
              strokeWidth={2}
            />
            <text
              x={side === "right" ? x + 10 : x - 10}
              y={y + 3.5}
              textAnchor={side === "right" ? "start" : "end"}
              className={`pointer-events-none font-crimson text-[11px] italic transition-colors ${
                isActive ? "fill-brand" : "fill-foreground/70"
              }`}
            >
              {trip.location.split(",")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
