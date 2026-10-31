"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type Origin = { x: number; y: number };
type Phase = "idle" | "covering" | "covered" | "revealing";

type LanguageTransitionContextValue = {
  cover: (origin: Origin) => Promise<void>;
  reveal: () => Promise<void>;
};

const LanguageTransitionContext =
  createContext<LanguageTransitionContextValue | null>(null);

const COVER_MS = 520;
const REVEAL_MS = 420;
const REDUCED_MS = 140;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function LanguageTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [origin, setOrigin] = useState<Origin>({ x: 50, y: 50 });
  const reducedMotion = usePrefersReducedMotion();
  const busyRef = useRef(false);

  const cover = useCallback(
    async (next: Origin) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setOrigin(next);
      setPhase("covering");
      await wait(reducedMotion ? REDUCED_MS : COVER_MS);
      setPhase("covered");
    },
    [reducedMotion]
  );

  const reveal = useCallback(async () => {
    setPhase("revealing");
    await wait(reducedMotion ? REDUCED_MS : REVEAL_MS);
    setPhase("idle");
    busyRef.current = false;
  }, [reducedMotion]);

  const value = useMemo(() => ({ cover, reveal }), [cover, reveal]);

  return (
    <LanguageTransitionContext.Provider value={value}>
      {children}
      <div
        aria-hidden="true"
        data-phase={phase}
        className="lang-transition-overlay"
        style={
          {
            "--origin-x": `${origin.x}px`,
            "--origin-y": `${origin.y}px`,
          } as React.CSSProperties
        }
      >
        <span className="lang-transition-mark" />
      </div>
    </LanguageTransitionContext.Provider>
  );
}

export function useLanguageTransition() {
  const ctx = useContext(LanguageTransitionContext);
  if (!ctx) {
    throw new Error(
      "useLanguageTransition must be used within a LanguageTransitionProvider"
    );
  }
  return ctx;
}
