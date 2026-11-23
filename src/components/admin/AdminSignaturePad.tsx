"use client";

import { useRef } from "react";

export function AdminSignaturePad({ name, clearLabel }: { name: string; clearLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const drawingRef = useRef(false);

  function getContext() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function pointerPos(canvas: HTMLCanvasElement, event: React.PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function updateHidden() {
    if (canvasRef.current && hiddenRef.current) {
      hiddenRef.current.value = canvasRef.current.toDataURL("image/png");
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    drawingRef.current = true;
    const { x, y } = pointerPos(canvas, event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx || !drawingRef.current) return;
    const { x, y } = pointerPos(canvas, event);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111111";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    updateHidden();
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (hiddenRef.current) hiddenRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <input ref={hiddenRef} type="hidden" name={name} defaultValue="" />
      <canvas
        ref={canvasRef}
        width={440}
        height={140}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full touch-none rounded-2xl border border-ink/10 bg-paper/80"
      />
      <button
        type="button"
        onClick={clearCanvas}
        className="self-start rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-xs font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
      >
        {clearLabel}
      </button>
    </div>
  );
}
