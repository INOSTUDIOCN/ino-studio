"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle, Vec2, Vec3 } from "ogl";
import { vertex, fragment } from "@/components/background/breathingShader";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useMediaQuery } from "@/lib/useMediaQuery";

type Blob = {
  target: { x: number; y: number };
  pos: { x: number; y: number };
  radius: number;
  damping: number;
  offset: { x: number; y: number };
  wanderPhase: number;
  wanderSpeed: number;
};

type SceneConfig = {
  restingCenter: { x: number; y: number };
  blobs: Array<{
    radius: number;
    damping: number;
    offset: { x: number; y: number };
    wanderPhase: number;
    wanderSpeed: number;
  }>;
  pointerInfluence: number;
};

const SCENES: Record<"home" | "services", SceneConfig> = {
  home: {
    restingCenter: { x: 0.78, y: 0.66 },
    blobs: [
      { radius: 0.11, damping: 0.08, offset: { x: 0, y: 0 }, wanderPhase: 0, wanderSpeed: 0.18 },
      { radius: 0.07, damping: 0.05, offset: { x: 0.06, y: 0.05 }, wanderPhase: 2.1, wanderSpeed: 0.13 },
      { radius: 0.05, damping: 0.035, offset: { x: -0.07, y: -0.06 }, wanderPhase: 4.2, wanderSpeed: 0.21 },
    ],
    pointerInfluence: 1,
  },
  services: {
    restingCenter: { x: 0.2, y: 0.74 },
    blobs: [
      { radius: 0.11, damping: 0.08, offset: { x: 0, y: 0 }, wanderPhase: 0.6, wanderSpeed: 0.15 },
      { radius: 0.07, damping: 0.05, offset: { x: 0.06, y: 0.05 }, wanderPhase: 2.7, wanderSpeed: 0.12 },
      { radius: 0.05, damping: 0.035, offset: { x: -0.07, y: -0.06 }, wanderPhase: 4.9, wanderSpeed: 0.2 },
    ],
    pointerInfluence: 1,
  },
};

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function BreathingBackground({
  variant,
  layer = "back",
  cardSelector,
}: {
  variant: "home" | "services";
  layer?: "back" | "front";
  /** CSS selector for a card the blob should dilute into when it overlaps it. */
  cardSelector?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const hasFinePointer = useMediaQuery("(pointer: fine)");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const config = SCENES[variant];
    const restingCenter = config.restingCenter;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
    } catch {
      return;
    }

    const gl = renderer.gl;
    if (!gl) return;

    gl.canvas.style.display = "block";
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uResolution: { value: new Vec2(1, 1) },
        uTime: { value: 0 },
        uIntro: { value: reducedMotion ? 1 : 0 },
        uDiluted: { value: 0 },
        uBlobA: { value: new Vec3(restingCenter.x, restingCenter.y, config.blobs[0].radius) },
        uBlobB: { value: new Vec3(restingCenter.x, restingCenter.y, config.blobs[1].radius) },
        uBlobC: { value: new Vec3(restingCenter.x, restingCenter.y, config.blobs[2].radius) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const blobs: Blob[] = config.blobs.map((b) => ({
      target: { ...restingCenter },
      pos: { ...restingCenter },
      radius: b.radius,
      damping: b.damping,
      offset: b.offset,
      wanderPhase: b.wanderPhase,
      wanderSpeed: b.wanderSpeed,
    }));
    const uniformKeys = ["uBlobA", "uBlobB", "uBlobC"] as const;

    let cachedCard: Element | null = null;
    let cachedRect: DOMRect | null = null;
    let rectFrameCounter = 0;
    const RECT_REFRESH_INTERVAL = 6;

    function refreshCardRect() {
      if (!cardSelector) return;
      if (!cachedCard) {
        cachedCard = document.querySelector(cardSelector);
      }
      if (cachedCard) {
        cachedRect = cachedCard.getBoundingClientRect();
      }
    }

    function resize() {
      const { clientWidth, clientHeight } = container!;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.uResolution.value.set(clientWidth, clientHeight);
      refreshCardRect();
    }
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: restingCenter.x, y: restingCenter.y, hasMoved: false };

    function setPointerFromClient(clientX: number, clientY: number) {
      const rect = container!.getBoundingClientRect();
      pointer.x = (clientX - rect.left) / rect.width;
      pointer.y = 1 - (clientY - rect.top) / rect.height;
      pointer.hasMoved = true;
    }

    function onPointerMove(event: PointerEvent) {
      setPointerFromClient(event.clientX, event.clientY);
    }

    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    let raf = 0;
    let startTime = performance.now();
    const introStart = performance.now();
    let visible = document.visibilityState === "visible";

    function onVisibilityChange() {
      visible = document.visibilityState === "visible";
      if (visible) {
        startTime = performance.now() - elapsed * 1000;
        tick();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    let elapsed = 0;
    let dilutedValue = 0;

    function computeTargetDilution() {
      if (!cardSelector || !cachedRect) return 0;

      const { clientWidth, clientHeight } = container!;
      const rect = cachedRect;
      const primary = blobs[0];
      const blobX = primary.pos.x * clientWidth;
      const blobY = (1 - primary.pos.y) * clientHeight;
      const radiusPx = primary.radius * clientHeight;

      const closestX = Math.max(rect.left, Math.min(blobX, rect.right));
      const closestY = Math.max(rect.top, Math.min(blobY, rect.bottom));
      const dist = Math.hypot(blobX - closestX, blobY - closestY);

      return Math.max(0, Math.min(1, 1 - dist / radiusPx));
    }

    function tick() {
      if (!visible) return;
      elapsed = (performance.now() - startTime) / 1000;
      program.uniforms.uTime.value = elapsed;

      if (!reducedMotion) {
        const introElapsed = (performance.now() - introStart) / 1000;
        const introT = Math.min(introElapsed / 0.9, 1);
        program.uniforms.uIntro.value = Math.min(easeOutBack(introT), 1.08);

        blobs.forEach((blob) => {
          const wanderX = Math.cos(elapsed * blob.wanderSpeed + blob.wanderPhase) * 0.022;
          const wanderY = Math.sin(elapsed * blob.wanderSpeed * 1.3 + blob.wanderPhase) * 0.018;

          let desiredX: number;
          let desiredY: number;

          if (pointer.hasMoved) {
            const influence = config.pointerInfluence;
            desiredX =
              restingCenter.x * (1 - influence) +
              (pointer.x + blob.offset.x * 0.6) * influence +
              wanderX * 0.3;
            desiredY =
              restingCenter.y * (1 - influence) +
              (pointer.y + blob.offset.y * 0.6) * influence +
              wanderY * 0.3;
          } else {
            desiredX = restingCenter.x + blob.offset.x + wanderX;
            desiredY = restingCenter.y + blob.offset.y + wanderY;
          }

          blob.target.x = desiredX;
          blob.target.y = desiredY;
          blob.pos.x += (blob.target.x - blob.pos.x) * blob.damping;
          blob.pos.y += (blob.target.y - blob.pos.y) * blob.damping;
        });

        blobs.forEach((blob, i) => {
          const key = uniformKeys[i];
          program.uniforms[key].value.set(blob.pos.x, blob.pos.y, blob.radius);
        });

        if (cardSelector) {
          if (rectFrameCounter % RECT_REFRESH_INTERVAL === 0) {
            refreshCardRect();
          }
          rectFrameCounter++;
          const targetDilution = computeTargetDilution();
          dilutedValue += (targetDilution - dilutedValue) * 0.1;
          program.uniforms.uDiluted.value = dilutedValue;
        }
      }

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(tick);
    }

    if (reducedMotion) {
      blobs.forEach((blob, i) => {
        const key = uniformKeys[i];
        program.uniforms[key].value.set(
          restingCenter.x + blob.offset.x,
          restingCenter.y + blob.offset.y,
          blob.radius
        );
      });
      renderer.render({ scene: mesh });
    } else {
      tick();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      container?.removeChild(gl.canvas);
    };
  }, [variant, reducedMotion, layer, cardSelector, hasFinePointer]);

  if (!hasFinePointer) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none ${layer === "front" ? "z-10" : "-z-10"}`}
    />
  );
}
