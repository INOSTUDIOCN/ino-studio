"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input[type="checkbox"], input[type="radio"], input[type="submit"], input[type="button"], select, summary, label';
const TEXT_SELECTOR =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]';

type CursorState = "default" | "hover" | "text";

type Spring = { pos: { x: number; y: number }; vel: { x: number; y: number } };

function springStep(spring: Spring, target: { x: number; y: number }, stiffness: number, damping: number, dt: number) {
  (["x", "y"] as const).forEach((axis) => {
    const force = (target[axis] - spring.pos[axis]) * stiffness;
    const accel = force - spring.vel[axis] * damping;
    spring.vel[axis] += accel * dt;
    spring.pos[axis] += spring.vel[axis] * dt;
  });
}

function getLuminance(rgb: [number, number, number]) {
  const [r, g, b] = rgb;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function isDarkSurface(el: Element | null) {
  let node: Element | null = el;
  for (let i = 0; i < 4 && node; i++) {
    const bg = getComputedStyle(node).backgroundColor;
    const parts = bg.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      const alpha = parts.length === 4 ? Number(parts[3]) : 1;
      if (alpha > 0.5) {
        return getLuminance([Number(parts[0]), Number(parts[1]), Number(parts[2])]) < 0.5;
      }
    }
    node = node.parentElement;
  }
  return false;
}

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotInnerRef = useRef<HTMLDivElement>(null);
  const ringInnerRef = useRef<HTMLDivElement>(null);
  const hasFinePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!hasFinePointer) return;

    const dotWrap = dotRef.current;
    const ringWrap = ringRef.current;
    const dotInner = dotInnerRef.current;
    const ringInner = ringInnerRef.current;
    if (!dotWrap || !ringWrap || !dotInner || !ringInner) return;

    document.documentElement.classList.add("custom-cursor-active");

    const raw = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let magnetCenter: { x: number; y: number } | null = null;
    let visible = false;
    let state: CursorState = "default";
    let dark = false;
    let raf = 0;
    let lastTime = performance.now();

    const ringSpring: Spring = { pos: { ...raw }, vel: { x: 0, y: 0 } };
    const dotSpring: Spring = { pos: { ...raw }, vel: { x: 0, y: 0 } };

    function setState(next: CursorState, nextDark: boolean) {
      if (next !== state) {
        state = next;
        dotWrap!.dataset.state = state;
        ringWrap!.dataset.state = state;
      }
      if (nextDark !== dark) {
        dark = nextDark;
        if (dark) {
          dotWrap!.dataset.tone = "dark";
          ringWrap!.dataset.tone = "dark";
        } else {
          delete dotWrap!.dataset.tone;
          delete ringWrap!.dataset.tone;
        }
      }
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
        ringSpring.pos = { ...raw };
        dotSpring.pos = { ...raw };
      }
      show();

      const target = event.target as Element | null;
      const interactive = target?.closest(INTERACTIVE_SELECTOR) ?? null;
      const textEl = target?.closest(TEXT_SELECTOR) ?? null;

      if (textEl) {
        magnetCenter = null;
        setState("text", false);
      } else if (interactive) {
        const rect = interactive.getBoundingClientRect();
        magnetCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        setState("hover", isDarkSurface(interactive));
      } else {
        magnetCenter = null;
        setState("default", false);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const target = event.target as Element | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        ringWrap!.dataset.pressed = "true";
      }
    }

    function onPointerUp() {
      delete ringWrap!.dataset.pressed;
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    const RING_STIFFNESS = reducedMotion ? 900 : 190;
    const RING_DAMPING = reducedMotion ? 60 : 15;
    const DOT_STIFFNESS = reducedMotion ? 900 : 320;
    const DOT_DAMPING = reducedMotion ? 60 : 24;

    function tick(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const target = magnetCenter ?? raw;
      springStep(ringSpring, target, RING_STIFFNESS, RING_DAMPING, dt);
      springStep(dotSpring, target, DOT_STIFFNESS, DOT_DAMPING, dt);

      if (reducedMotion) {
        ringWrap!.style.transform = `translate3d(${ringSpring.pos.x}px, ${ringSpring.pos.y}px, 0)`;
        dotWrap!.style.transform = `translate3d(${dotSpring.pos.x}px, ${dotSpring.pos.y}px, 0)`;
        ringInner!.style.filter = "";
        dotInner!.style.filter = "";
      } else {
        const ringSpeed = Math.hypot(ringSpring.vel.x, ringSpring.vel.y);
        const ringStretch = Math.min(ringSpeed * 0.0009, 0.55);
        const ringAngle = (Math.atan2(ringSpring.vel.y, ringSpring.vel.x) * 180) / Math.PI;
        ringWrap!.style.transform = `translate3d(${ringSpring.pos.x}px, ${ringSpring.pos.y}px, 0) rotate(${ringAngle}deg) scale(${1 + ringStretch}, ${1 - ringStretch * 0.55}) rotate(${-ringAngle}deg)`;
        ringInner!.style.filter = ringSpeed > 400 ? `blur(${Math.min((ringSpeed - 400) * 0.006, 3.5)}px)` : "";

        const dotSpeed = Math.hypot(dotSpring.vel.x, dotSpring.vel.y);
        const dotStretch = Math.min(dotSpeed * 0.0006, 0.4);
        const dotAngle = (Math.atan2(dotSpring.vel.y, dotSpring.vel.x) * 180) / Math.PI;
        dotWrap!.style.transform = `translate3d(${dotSpring.pos.x}px, ${dotSpring.pos.y}px, 0) rotate(${dotAngle}deg) scale(${1 + dotStretch}, ${1 - dotStretch * 0.5}) rotate(${-dotAngle}deg)`;
        dotInner!.style.filter = dotSpeed > 500 ? `blur(${Math.min((dotSpeed - 500) * 0.004, 2)}px)` : "";
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [hasFinePointer, reducedMotion]);

  if (!hasFinePointer) return null;

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot-wrap" aria-hidden="true">
        <div ref={dotInnerRef} className="custom-cursor-dot" />
      </div>
      <div ref={ringRef} className="custom-cursor-ring-wrap" aria-hidden="true">
        <div ref={ringInnerRef} className="custom-cursor-ring" />
      </div>
    </>
  );
}
