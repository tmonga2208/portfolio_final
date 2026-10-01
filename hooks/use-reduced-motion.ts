"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

/** True when the user has asked the OS to minimise motion. */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
