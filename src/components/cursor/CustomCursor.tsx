"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input[type="checkbox"], input[type="radio"], input[type="submit"], input[type="button"], select, summary, label';
const TEXT_SELECTOR =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]';

type CursorState = "default" | "hover" | "text";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const hasFinePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!hasFinePointer) return;

    const dotWrap = dotRef.current;
    const ringWrap = ringRef.current;
    if (!dotWrap || !ringWrap) return;

    document.documentElement.classList.add("custom-cursor-active");

    const raw = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...raw };
    let visible = false;
    let state: CursorState = "default";
    let raf = 0;

    function setState(next: CursorState) {
      if (next === state) return;
      state = next;
      dotWrap!.dataset.state = state;
      ringWrap!.dataset.state = state;
    }

    function show() {
      if (visible) return;
      visible = true;
      dotWrap!.style.opacity = "1";
      ringWrap!.style.opacity = "1";
    }

    function hide() {
      visible = false;
      dotWrap!.style.opacity = "0";
      ringWrap!.style.opacity = "0";
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      raw.x = event.clientX;
      raw.y = event.clientY;
      if (!visible) {
        ringPos.x = raw.x;
        ringPos.y = raw.y;
      }
      show();

      const target = event.target as Element | null;
      if (target?.closest(TEXT_SELECTOR)) setState("text");
      else if (target?.closest(INTERACTIVE_SELECTOR)) setState("hover");
      else setState("default");
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    function tick() {
      const lag = reducedMotion ? 1 : 0.22;
      ringPos.x += (raw.x - ringPos.x) * lag;
      ringPos.y += (raw.y - ringPos.y) * lag;

      dotWrap!.style.transform = `translate3d(${raw.x}px, ${raw.y}px, 0)`;
      ringWrap!.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;

      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [hasFinePointer, reducedMotion]);

  if (!hasFinePointer) return null;

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot-wrap" aria-hidden="true">
        <div className="custom-cursor-dot" />
      </div>
      <div ref={ringRef} className="custom-cursor-ring-wrap" aria-hidden="true">
        <div className="custom-cursor-ring" />
      </div>
    </>
  );
}
