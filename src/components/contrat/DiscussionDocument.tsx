"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ContractContent } from "@/components/contrat/ContractContent";
import { collectTaskItems, type JSONContent } from "@/lib/contract-content";

export function DiscussionDocument({
  submitAction,
  content,
  labels,
}: {
  submitAction: (selected: string[]) => Promise<{ downloadUrl: string | null }>;
  content: JSONContent;
  labels: {
    title: string;
    subtitle: string;
    review: string;
    reviewTitle: string;
    checked: string;
    unchecked: string;
    back: string;
    submit: string;
    submitting: string;
    completed: string;
    downloadPdf: string;
  };
}) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [stage, setStage] = useState<"reading" | "review">("reading");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const taskItems = collectTaskItems(content);

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

  if (stage === "review") {
    const checked = taskItems.filter((item) => checkedIds.has(item.id));
    const unchecked = taskItems.filter((item) => !checkedIds.has(item.id));

    return (
      <GlassPanel className="mx-auto max-w-2xl rounded-3xl p-8 text-left">
        <h2 className="font-display text-lg font-semibold text-ink">{labels.reviewTitle}</h2>

        <div className="mt-6">
          <h3 className="text-sm font-semibold tracking-wide text-ink-soft uppercase">{labels.checked}</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {checked.length === 0 && <li className="text-sm text-ink-soft">—</li>}
            {checked.map((item) => (
              <li key={item.id} className="rounded-xl border border-ink/10 bg-paper/60 px-3 py-2 text-sm text-ink">
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold tracking-wide text-ink-soft uppercase">{labels.unchecked}</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {unchecked.length === 0 && <li className="text-sm text-ink-soft">—</li>}
            {unchecked.map((item) => (
              <li key={item.id} className="rounded-xl border border-ink/10 bg-paper/40 px-3 py-2 text-sm text-ink-soft">
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStage("reading")}
            className="rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            {labels.back}
          </button>
          <span className="cta-scan">
            <button
              type="button"
              disabled={pending}
              onClick={async () => {
                setPending(true);
                try {
                  const result = await submitAction(checked.map((item) => item.label));
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

  return (
    <GlassPanel className="mx-auto max-w-2xl rounded-3xl p-8 text-left">
      <h2 className="font-display text-lg font-semibold text-ink">{labels.title}</h2>
      <p className="mt-2 text-sm text-ink-soft">{labels.subtitle}</p>

      <div className="mt-6">
        <ContractContent
          doc={content}
          checkedIds={checkedIds}
          onToggle={(id, checked) => {
            setCheckedIds((prev) => {
              const next = new Set(prev);
              if (checked) next.add(id);
              else next.delete(id);
              return next;
            });
          }}
        />
      </div>

      <span className="cta-scan mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setStage("review")}
          className="cta-scan-inner px-9 py-4 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
        >
          {labels.review}
        </button>
      </span>
    </GlassPanel>
  );
}
