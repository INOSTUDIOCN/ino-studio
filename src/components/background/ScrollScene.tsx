"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle, Vec2, Vec3, Vec4 } from "ogl";
import { vertex, fragment } from "@/components/background/scrollSceneShader";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type Vec3Tuple = [number, number, number];

type BlobConfig = {
  pos: Vec3Tuple;
  radius: number;
  wanderPhase: number;
  wanderSpeed: number;
  wanderAmount: number;
};

type CameraFrame = { pos: Vec3Tuple; lookAt: Vec3Tuple };

type SceneConfig = {
  blobs: [BlobConfig, BlobConfig, BlobConfig];
  fovDeg: number;
  restingProgress: number;
  cameraPath: (progress: number) => CameraFrame;
};

function blob(pos: Vec3Tuple, radius: number, wanderPhase = 0, wanderSpeed = 0.15, wanderAmount = 0.06): BlobConfig {
  return { pos, radius, wanderPhase, wanderSpeed, wanderAmount };
}

const SCENES: Record<"home" | "services" | "studio", SceneConfig> = {
  home: {
    blobs: [
      blob([2.9, 1.6, -0.4], 1.05, 0, 0.16, 0.05),
      blob([3.45, 1.95, -0.1], 0.68, 2.1, 0.12, 0.045),
      blob([2.4, 1.3, 0.05], 0.48, 4.2, 0.2, 0.04),
    ],
    fovDeg: 45,
    restingProgress: 0,
    cameraPath: (progress) => ({
      pos: [0, 0, 8.5 - progress * 0.9],
      lookAt: [0.6, 0.35, -3 + progress * 0.6],
    }),
  },
  services: {
    blobs: [
      blob([-1.9, 2.0, 1.4], 0.85, 0, 0.14, 0.05),
      blob([0.3, 1.75, -1.2], 0.95, 2.4, 0.1, 0.045),
      blob([2.3, 2.1, -3.4], 0.75, 4.6, 0.17, 0.05),
    ],
    fovDeg: 48,
    restingProgress: 0.1,
    cameraPath: (progress) => {
      const z = 9 - progress * 7.5;
      const x = Math.sin(progress * Math.PI) * 1.1;
      return {
        pos: [x, 0.5, z],
        lookAt: [x * 0.5 + 0.2, 1.1, z - 4],
      };
    },
  },
  studio: {
    blobs: [
      blob([-0.6, 3.0, 0.3], 0.78, 0, 0.13, 0.04),
      blob([1.5, 2.8, -0.4], 0.64, 2.6, 0.15, 0.04),
      blob([0.5, 2.4, 0.5], 0.5, 4.8, 0.11, 0.035),
    ],
    fovDeg: 46,
    restingProgress: 0.15,
    cameraPath: (progress) => {
      const angle = progress * Math.PI * 0.55 - 0.1;
      const radius = 8.5;
      return {
        pos: [Math.sin(angle) * radius, 1.5 + Math.sin(progress * Math.PI) * 0.4, Math.cos(angle) * radius],
        lookAt: [0.5, 0.9, 0],
      };
    },
  },
};

const SCROLL_RANGE_PX = 900;

function cross(a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function normalize(v: Vec3Tuple): Vec3Tuple {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function subtract(a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function ScrollScene({ variant }: { variant: "home" | "services" | "studio" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const config = SCENES[variant];

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1.5), alpha: false });
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
        uBlobA: { value: new Vec4(...config.blobs[0].pos, config.blobs[0].radius) },
        uBlobB: { value: new Vec4(...config.blobs[1].pos, config.blobs[1].radius) },
        uBlobC: { value: new Vec4(...config.blobs[2].pos, config.blobs[2].radius) },
        uCamPos: { value: new Vec3(0, 0, 7) },
        uCamRight: { value: new Vec3(1, 0, 0) },
        uCamUp: { value: new Vec3(0, 1, 0) },
        uCamForward: { value: new Vec3(0, 0, -1) },
        uTanFov: { value: Math.tan((config.fovDeg * Math.PI) / 360) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    const blobUniformKeys = ["uBlobA", "uBlobB", "uBlobC"] as const;

    let lateralScale = 1;
    function resize() {
      const { clientWidth, clientHeight } = container!;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.uResolution.value.set(clientWidth, clientHeight);
      const aspect = clientWidth / clientHeight;
      lateralScale = Math.min(1, Math.max(0.45, aspect / 1.3));
    }
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: 0, y: 0 };
    function onPointerMove(event: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
      pointer.y = 0.5 - (event.clientY - rect.top) / rect.height;
    }
    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    let scrollTarget = reducedMotion ? config.restingProgress : 0;
    let scrollSmoothed = scrollTarget;
    function onScroll() {
      scrollTarget = Math.min(1, Math.max(0, window.scrollY / SCROLL_RANGE_PX));
    }
    if (!reducedMotion) {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
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

    function applyCamera(progress: number) {
      const frame = config.cameraPath(progress);
      const camPos: Vec3Tuple = [frame.pos[0] * lateralScale, frame.pos[1], frame.pos[2]];
      const lookAt: Vec3Tuple = [
        frame.lookAt[0] * lateralScale + pointer.x * 0.35,
        frame.lookAt[1] + pointer.y * 0.25,
        frame.lookAt[2],
      ];

      const forward = normalize(subtract(lookAt, camPos));
      const worldUp: Vec3Tuple = [0, 1, 0];
      const right = normalize(cross(forward, worldUp));
      const up = cross(right, forward);

      program.uniforms.uCamPos.value.set(...camPos);
      program.uniforms.uCamForward.value.set(...forward);
      program.uniforms.uCamRight.value.set(...right);
      program.uniforms.uCamUp.value.set(...up);
    }

    function tick() {
      if (!visible) return;
      elapsed = (performance.now() - startTime) / 1000;
      program.uniforms.uTime.value = elapsed;

      if (!reducedMotion) {
        const introElapsed = (performance.now() - introStart) / 1000;
        const introT = Math.min(introElapsed / 0.9, 1);
        program.uniforms.uIntro.value = Math.min(easeOutBack(introT), 1.08);

        scrollSmoothed += (scrollTarget - scrollSmoothed) * 0.065;

        config.blobs.forEach((b, i) => {
          const wobbleX = Math.cos(elapsed * b.wanderSpeed + b.wanderPhase) * b.wanderAmount;
          const wobbleY = Math.sin(elapsed * b.wanderSpeed * 1.3 + b.wanderPhase) * b.wanderAmount * 0.8;
          const wobbleZ = Math.sin(elapsed * b.wanderSpeed * 0.7 + b.wanderPhase) * b.wanderAmount * 0.6;
          const key = blobUniformKeys[i];
          program.uniforms[key].value.set(
            (b.pos[0] + wobbleX) * lateralScale,
            b.pos[1] + wobbleY,
            b.pos[2] + wobbleZ,
            b.radius
          );
        });

        applyCamera(scrollSmoothed);
      }

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(tick);
    }

    if (reducedMotion) {
      config.blobs.forEach((b, i) => {
        const key = blobUniformKeys[i];
        program.uniforms[key].value.set(b.pos[0] * lateralScale, b.pos[1], b.pos[2], b.radius);
      });
      applyCamera(config.restingProgress);
      renderer.render({ scene: mesh });
    } else {
      tick();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      container?.removeChild(gl.canvas);
    };
  }, [variant, reducedMotion]);

  return <div ref={containerRef} aria-hidden="true" className="fixed inset-0 -z-10" />;
}
