"use client";

import { useSyncExternalStore } from "react";

const clock = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const subscribeToClock = (onTick: () => void) => {
  const id = setInterval(onTick, 15_000);
  return () => clearInterval(id);
};

/** Availability and Tarun's local time, under the contact headline. */
export function Availability() {
  // Client-only: the page is prerendered at build time, so a server-rendered
  // time would be stale. The snapshot only changes when the minute does.
  const time = useSyncExternalStore(subscribeToClock, () => clock.format(new Date()), () => null);

  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 font-sans text-sm">
      <span className="inline-flex items-center gap-2.5 rounded-full border border-border px-4 py-2">
        <span aria-hidden className="relative flex size-2">
          <span className="absolute inline-flex size-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        Open to full-time roles
      </span>
      {time && (
        <span className="text-muted-foreground">
          <time>{time}</time> in Gurugram
        </span>
      )}
    </div>
  );
}
