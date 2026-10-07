"use client";

import { MotionConfig } from "framer-motion";
import { StoreProvider } from "./StoreProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>{children}</StoreProvider>
    </MotionConfig>
  );
}
