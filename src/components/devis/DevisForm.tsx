"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { submitDevisRequest, type DevisFormState } from "@/app/[locale]/devis/actions";

const initialState: DevisFormState = { status: "idle" };

const SERVICE_OPTIONS = ["web", "discord", "app", "other"] as const;

const fieldClass =
  "w-full rounded-2xl border border-ink/10 bg-paper/70 px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-ink/30 focus:outline-none transition-colors duration-200";

export function DevisForm() {
  const t = useTranslations("devis.form");
  const [state, formAction, pending] = useActionState(submitDevisRequest, initialState);

  if (state.status === "success") {
    return (
      <GlassPanel className="mx-auto max-w-lg rounded-3xl p-8 text-center">
        <p className="font-display text-lg font-semibold text-ink">{t("success")}</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="mx-auto max-w-lg rounded-3xl p-8 text-left">
      <form action={formAction} className="flex flex-col gap-4">
        <input
          name="name"
          type="text"
          required
          placeholder={t("name")}
          className={fieldClass}
        />
        <input
          name="email"
          type="email"
          required
          placeholder={t("email")}
          className={fieldClass}
        />
        <GlassSelect
          name="service"
          required
          placeholder={t("service")}
          options={SERVICE_OPTIONS.map((option) => ({
            value: option,
            label: t(`serviceOptions.${option}`),
          }))}
        />
        <textarea
          name="message"
          required
          rows={5}
          placeholder={t("messagePlaceholder")}
          className={`${fieldClass} resize-none`}
        />

        {state.status === "error" && (
          <p className="text-sm text-ink-soft">{t("error")}</p>
        )}

        <span className="cta-scan mt-2 self-center">
          <button
            type="submit"
            disabled={pending}
            className="cta-scan-inner px-9 py-4 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03] disabled:opacity-60"
          >
            {pending ? t("submitting") : t("submit")}
          </button>
        </span>
      </form>
    </GlassPanel>
  );
}
