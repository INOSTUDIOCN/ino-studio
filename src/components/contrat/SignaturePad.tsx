"use client";

import { useRef, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ContractContent } from "@/components/contrat/ContractContent";
import type { JSONContent } from "@/lib/contract-content";

export function SignaturePad({
  signAction,
  content,
  labels,
}: {
  signAction: (dataUrl: string) => Promise<{ downloadUrl: string | null }>;
  content: JSONContent;
  labels: {
    title: string;
    subtitle: string;
    clear: string;
    submit: string;
    submitting: string;
    required: string;
    completed: string;
    downloadPdf: string;
  };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  function getContext() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  function pointerPos(canvas: HTMLCanvasElement, event: React.PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
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
    hasDrawnRef.current = true;
  }

  function handlePointerUp() {
    drawingRef.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawnRef.current = false;
    setError(false);
  }

  if (done) {
    return (
      <GlassPanel className="mx-auto max-w-2xl rounded-3xl p-8 text-center">
        <p className="font-display text-lg font-semibold text-ink">{labels.completed}</p>
        {downloadUrl && (
          <a href={downloadUrl} className="mt-4 inline-block text-sm font-medium text-ink underline">
            {labels.downloadPdf}
          </a>
        )}
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="mx-auto max-w-2xl rounded-3xl p-8 text-left">
      <div className="max-h-96 overflow-y-auto rounded-2xl border border-ink/10 bg-paper/60 px-4 py-4">
        <ContractContent doc={content} />
      </div>

      <canvas
        ref={canvasRef}
        width={440}
        height={160}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="mt-4 w-full touch-none rounded-2xl border border-ink/10 bg-paper/80"
      />

      {error && <p className="mt-2 text-sm text-ink-soft">{labels.required}</p>}

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={clearCanvas}
          className="rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-xs font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          {labels.clear}
        </button>

        <span className="cta-scan">
          <button
            type="button"
            disabled={pending}
            onClick={async () => {
              const canvas = canvasRef.current;
              if (!canvas || !hasDrawnRef.current) {
                setError(true);
                return;
              }
              setPending(true);
              try {
                const result = await signAction(canvas.toDataURL("image/png"));
                setDownloadUrl(result.downloadUrl);
                setDone(true);
              } finally {
                setPending(false);
              }
            }}
            className="cta-scan-inner px-9 py-4 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03] disabled:opacity-60"
          >
            {pending ? labels.submitting : labels.submit}
          </button>
        </span>
      </div>
    </GlassPanel>
  );
}
