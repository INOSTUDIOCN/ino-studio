"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function CompletedPanel({
  message,
  downloadUrl,
  downloadLabel,
  redirectHref,
  redirectingLabel,
  backLabel,
}: {
  message: string;
  downloadUrl: string | null;
  downloadLabel: string;
  redirectHref: string;
  redirectingLabel: string;
  backLabel: string;
}) {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.location.href = redirectHref;
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [redirectHref]);

  return (
    <GlassPanel className="mx-auto max-w-2xl rounded-3xl p-8 text-center">
      <p className="font-display text-lg font-semibold text-ink">{message}</p>
      {downloadUrl && (
        <a href={downloadUrl} className="mt-4 inline-block text-sm font-medium text-ink underline">
          {downloadLabel}
        </a>
      )}
      <p className="mt-6 text-xs text-ink-soft">
        {redirectingLabel} ({secondsLeft}s)
      </p>
      <a href={redirectHref} className="mt-1 inline-block text-xs font-medium text-ink underline">
        {backLabel}
      </a>
    </GlassPanel>
  );
}
