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
          baseFrequency="0.009 0.014"
          numOctaves="2"
          seed="7"
          result="noise"
        >
          {!reducedMotion && (
            <animate
              attributeName="baseFrequency"
              dur="26s"
              values="0.009 0.014;0.013 0.019;0.009 0.014"
              repeatCount="indefinite"
            />
          )}
        </feTurbulence>
        <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="46"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
