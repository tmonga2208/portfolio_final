"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true in the browser — e.g. to gate portals. */
export function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
