"use client";

import { useEffect, useRef } from "react";

export const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input[type="checkbox"], input[type="radio"], input[type="submit"], input[type="button"], select, summary, label';
export const TEXT_SELECTOR =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]';

export type CursorState = "default" | "hover" | "text";

export type Tracking = {
  raw: { x: number; y: number };
  magnetTarget: { x: number; y: number } | null;
  state: CursorState;
  dark: boolean;
  pressed: boolean;
  visible: boolean;
};

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

export function useCursorTracking(active: boolean) {
  const tracking = useRef<Tracking>({
    raw: { x: -100, y: -100 },
    magnetTarget: null,
    state: "default",
    dark: false,
    pressed: false,
    visible: false,
  });

  useEffect(() => {
    if (!active) return;

    document.documentElement.classList.add("custom-cursor-active");
    const t = tracking.current;
    t.raw = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      t.raw.x = event.clientX;
      t.raw.y = event.clientY;
      t.visible = true;

      const target = event.target as Element | null;
      const interactive = target?.closest(INTERACTIVE_SELECTOR) ?? null;
      const textEl = target?.closest(TEXT_SELECTOR) ?? null;

      if (textEl) {
        t.magnetTarget = null;
        t.state = "text";
        t.dark = false;
      } else if (interactive) {
        const rect = interactive.getBoundingClientRect();
        t.magnetTarget = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        t.state = "hover";
        t.dark = isDarkSurface(interactive);
      } else {
        t.magnetTarget = null;
        t.state = "default";
        t.dark = false;
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      if ((event.target as Element | null)?.closest(INTERACTIVE_SELECTOR)) t.pressed = true;
    }
    function onPointerUp() {
      t.pressed = false;
    }
    function hide() {
      t.visible = false;
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [active]);

  return tracking;
}

export function springStep(
  pos: { x: number; y: number },
  vel: { x: number; y: number },
  target: { x: number; y: number },
  stiffness: number,
  damping: number,
  dt: number
) {
  (["x", "y"] as const).forEach((axis) => {
    const force = (target[axis] - pos[axis]) * stiffness;
    const accel = force - vel[axis] * damping;
    vel[axis] += accel * dt;
    pos[axis] += vel[axis] * dt;
  });
}
