"use client";

import { useMediaQuery } from "@/lib/useMediaQuery";

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
