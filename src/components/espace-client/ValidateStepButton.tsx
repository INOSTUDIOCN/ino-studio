"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { validateStep } from "@/app/[locale]/espace-client/actions";

export function ValidateStepButton({
  stepId,
  label,
  pendingLabel,
}: {
  stepId: string;
  label: string;
  pendingLabel: string;
}) {
  const locale = useLocale();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await validateStep(locale, stepId);
        } finally {
          setPending(false);
        }
      }}
      className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition-transform duration-200 hover:scale-[1.03] disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
