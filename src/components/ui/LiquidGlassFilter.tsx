"use client";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export function LiquidGlassFilter() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <svg
      aria-hidden="true"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <filter id="liquid-glass-distortion" colorInterpolationFilters="sRGB">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.0035 0.006"
          numOctaves="2"
          seed="7"
          result="noise"
        >
          {!reducedMotion && (
            <animate
              attributeName="baseFrequency"
              dur="30s"
              values="0.0035 0.006;0.005 0.008;0.0035 0.006"
              repeatCount="indefinite"
            />
          )}
        </feTurbulence>
        <feGaussianBlur in="noise" stdDeviation="6" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="34"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
