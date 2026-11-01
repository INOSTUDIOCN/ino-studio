"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { submitDiscussion } from "@/app/contrat/[token]/actions";

export function DiscussionForm({
  token,
  options,
  labels,
}: {
  token: string;
  options: string[];
  labels: { title: string; subtitle: string; submit: string; submitting: string; completed: string };
}) {
  const [selected, setSelected] = useState<string[]>([]);
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

      <div className="mt-6 flex flex-col gap-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3 text-sm text-ink"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) => {
                setSelected((prev) =>
                  event.target.checked ? [...prev, option] : prev.filter((item) => item !== option)
                );
              }}
            />
            {option}
          </label>
        ))}
      </div>

      <span className="cta-scan mt-6 flex justify-center">
        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            try {
              await submitDiscussion(token, selected);
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
    </GlassPanel>
  );
}
