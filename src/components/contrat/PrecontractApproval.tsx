"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { approvePrecontract } from "@/app/contrat/[token]/actions";

export function PrecontractApproval({
  token,
  summary,
  labels,
}: {
  token: string;
  summary: string;
  labels: { title: string; subtitle: string; approve: string; approving: string; completed: string };
}) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <GlassPanel className="mx-auto max-w-lg rounded-3xl p-8 text-center">
        <p className="font-display text-lg font-semibold text-ink">{labels.completed}</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="mx-auto max-w-lg rounded-3xl p-8 text-left">
      <h2 className="font-display text-lg font-semibold text-ink">{labels.title}</h2>
      <p className="mt-2 text-sm text-ink-soft">{labels.subtitle}</p>

      <p className="mt-6 whitespace-pre-wrap rounded-2xl border border-ink/10 bg-paper/60 px-4 py-4 text-sm text-ink">
        {summary}
      </p>

      <span className="cta-scan mt-6 flex justify-center">
        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            try {
              await approvePrecontract(token);
              setDone(true);
            } finally {
              setPending(false);
            }
          }}
          className="cta-scan-inner px-9 py-4 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03] disabled:opacity-60"
        >
          {pending ? labels.approving : labels.approve}
        </button>
      </span>
    </GlassPanel>
  );
}
