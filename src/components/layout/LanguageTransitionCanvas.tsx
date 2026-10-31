"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle, Vec2 } from "ogl";
import { vertex, fragment } from "@/components/layout/languageTransitionShader";

type Props = {
  active: boolean;
  origin: { x: number; y: number };
  progressMs: number;
};

export function LanguageTransitionCanvas({ active, origin, progressMs }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !active) return;

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
        uProgress: { value: 0 },
        uOrigin: { value: new Vec2(0.5, 0.5) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      const { clientWidth, clientHeight } = container!;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.uResolution.value.set(clientWidth, clientHeight);
    }
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    let raf = 0;

    function tick(now: number) {
      const elapsed = (now - start) / 1000;
      program.uniforms.uTime.value = elapsed;

      const rect = container!.getBoundingClientRect();
      const u = origin.x / rect.width;
      const v = 1 - origin.y / rect.height;
      program.uniforms.uOrigin.value.set(u, v);

      const t = Math.min(elapsed * 1000 / progressMs, 1);
      program.uniforms.uProgress.value = t;

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      container?.removeChild(gl.canvas);
    };
  }, [active, progressMs, origin]);

  return <div ref={containerRef} className="lang-transition-canvas" aria-hidden="true" />;
}
