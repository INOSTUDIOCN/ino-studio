"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle, Vec2, Vec3 } from "ogl";
import { vertex, fragment } from "@/components/background/shader";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type Blob = {
  target: { x: number; y: number };
  pos: { x: number; y: number };
  radius: number;
  damping: number;
  offset: { x: number; y: number };
  wanderPhase: number;
  wanderSpeed: number;
};

const RESTING_CENTER = { x: 0.78, y: 0.66 };

function createBlobs(): Blob[] {
  return [
    {
      target: { ...RESTING_CENTER },
      pos: { ...RESTING_CENTER },
      radius: 0.26,
      damping: 0.08,
      offset: { x: 0, y: 0 },
      wanderPhase: 0,
      wanderSpeed: 0.18,
    },
    {
      target: { ...RESTING_CENTER },
      pos: { ...RESTING_CENTER },
      radius: 0.17,
      damping: 0.05,
      offset: { x: 0.14, y: 0.12 },
      wanderPhase: 2.1,
      wanderSpeed: 0.13,
    },
    {
      target: { ...RESTING_CENTER },
      pos: { ...RESTING_CENTER },
      radius: 0.12,
      damping: 0.035,
      offset: { x: -0.16, y: -0.14 },
      wanderPhase: 4.2,
      wanderSpeed: 0.21,
    },
  ];
}

export function LiquidGlassBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: false });
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
        uBlobA: { value: new Vec3(0.78, 0.66, 0.26) },
        uBlobB: { value: new Vec3(0.92, 0.78, 0.17) },
        uBlobC: { value: new Vec3(0.62, 0.52, 0.12) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const blobs = createBlobs();
    const uniformKeys = ["uBlobA", "uBlobB", "uBlobC"] as const;

    function resize() {
      const { clientWidth, clientHeight } = container!;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.uResolution.value.set(clientWidth, clientHeight);
    }
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: RESTING_CENTER.x, y: RESTING_CENTER.y, active: false };
    let idleTimeout: ReturnType<typeof setTimeout> | null = null;

    function setPointerFromClient(clientX: number, clientY: number) {
      const rect = container!.getBoundingClientRect();
      pointer.x = (clientX - rect.left) / rect.width;
      pointer.y = 1 - (clientY - rect.top) / rect.height;
      pointer.active = true;
      if (idleTimeout) clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        pointer.active = false;
      }, 2200);
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

    function easeOutBack(t: number) {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
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
          let desiredX = RESTING_CENTER.x + blob.offset.x;
          let desiredY = RESTING_CENTER.y + blob.offset.y;

          if (pointer.active) {
            desiredX = pointer.x + blob.offset.x * 0.6;
            desiredY = pointer.y + blob.offset.y * 0.6;
          } else {
            desiredX += Math.cos(elapsed * blob.wanderSpeed + blob.wanderPhase) * 0.05;
            desiredY += Math.sin(elapsed * blob.wanderSpeed * 1.3 + blob.wanderPhase) * 0.04;
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
      }

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(tick);
    }

    if (reducedMotion) {
      blobs.forEach((blob, i) => {
        const key = uniformKeys[i];
        program.uniforms[key].value.set(
          RESTING_CENTER.x + blob.offset.x,
          RESTING_CENTER.y + blob.offset.y,
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
      if (idleTimeout) clearTimeout(idleTimeout);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      container?.removeChild(gl.canvas);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10"
    />
  );
}
