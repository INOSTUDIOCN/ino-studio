"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { springStep, useCursorTracking } from "@/components/cursor/useCursorTracking";

const BASE_SIZE = 8;
const MAX_LENGTH = 32;
const MIN_HEIGHT = 4;
const DEAD_ZONE = 70;
const STRETCH_RANGE = 480;

export function CustomCursor() {
  const hasFinePointer = useMediaQuery("(pointer: fine)");
  const tracking = useCursorTracking(hasFinePointer);
  const reducedMotion = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasFinePointer) return;
    const wrap = wrapRef.current!;
    const dot = dotRef.current!;

    const stiffness = reducedMotion ? 900 : 260;
    const damping = reducedMotion ? 60 : 20;

    const spring = { pos: { ...tracking.current.raw }, vel: { x: 0, y: 0 } };
    let storedAngle = 0;
    let lastTime = performance.now();
    let raf = 0;
    let lastState = "";
    let lastDark = false;
    let lastVisible = false;

    function tick(now: number) {
      const t = tracking.current;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const target = t.magnetTarget ?? t.raw;
      springStep(spring.pos, spring.vel, target, stiffness, damping, dt);
      wrap.style.transform = `translate3d(${spring.pos.x}px, ${spring.pos.y}px, 0)`;

      if (t.state === "hover") {
        dot.style.width = "";
        dot.style.height = "";
        dot.style.margin = "";
        dot.style.transform = "";
      } else if (!reducedMotion) {
        const speed = Math.hypot(spring.vel.x, spring.vel.y);
        if (speed > DEAD_ZONE) {
          storedAngle = (Math.atan2(spring.vel.y, spring.vel.x) * 180) / Math.PI;
        }
        const stretchT = Math.max(0, Math.min((speed - DEAD_ZONE) / STRETCH_RANGE, 1));
        const width = BASE_SIZE + stretchT * (MAX_LENGTH - BASE_SIZE);
        const height = BASE_SIZE - stretchT * (BASE_SIZE - MIN_HEIGHT);
        dot.style.width = `${width}px`;
        dot.style.height = `${height}px`;
        dot.style.margin = `${-height / 2}px 0 0 ${-width / 2}px`;
        dot.style.transform = stretchT > 0.01 ? `rotate(${storedAngle}deg)` : "";
      } else {
        dot.style.width = "";
        dot.style.height = "";
        dot.style.margin = "";
        dot.style.transform = "";
      }

      if (t.state !== lastState) {
        lastState = t.state;
        wrap.dataset.state = t.state;
      }
      if (t.dark !== lastDark) {
        lastDark = t.dark;
        if (t.dark) wrap.dataset.tone = "dark";
        else delete wrap.dataset.tone;
      }
      if (t.visible !== lastVisible) {
        lastVisible = t.visible;
        wrap.style.opacity = t.visible ? "1" : "0";
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasFinePointer, reducedMotion, tracking]);

  if (!hasFinePointer) return null;

  return (
    <div ref={wrapRef} className="custom-cursor-wrap" aria-hidden="true">
      <div ref={dotRef} className="custom-cursor-dot" />
    </div>
  );
}

