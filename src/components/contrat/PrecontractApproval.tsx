"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ContractContent } from "@/components/contrat/ContractContent";
import type { JSONContent } from "@/lib/contract-content";

export function PrecontractApproval({
  approveAction,
  content,
  labels,
}: {
  approveAction: () => Promise<{ downloadUrl: string | null }>;
  content: JSONContent;
  labels: {
    title: string;
    subtitle: string;
    approve: string;
    approving: string;
    completed: string;
    downloadPdf: string;
  };
}) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

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
      <ContractContent doc={content} />

      <span className="cta-scan mt-6 flex justify-center">
        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            try {
              const result = await approveAction();
              setDownloadUrl(result.downloadUrl);
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
