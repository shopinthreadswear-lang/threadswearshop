"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
/** True only on the client after hydration — safe gate for portals and browser-only UI. */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
