"use client";

import type { ReactNode } from "react";
import { useRevealOnView } from "@/lib/useRevealOnView";
import { cn } from "@/lib/cn";

export function RevealHero({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, visible } = useRevealOnView<HTMLSpanElement>();

  return (
    <span ref={ref} className="inline-block">
      <span
        className={cn("hero-reveal text-sheen", visible && "hero-reveal--visible", className)}
      >
        {children}
      </span>
    </span>
  );
}
