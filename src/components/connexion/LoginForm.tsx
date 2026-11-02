"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Link } from "@/i18n/navigation";
import { login, type LoginFormState } from "@/app/[locale]/connexion/actions";

const initialState: LoginFormState = { status: "idle" };

const fieldClass =
  "w-full rounded-2xl border border-ink/10 bg-paper/70 px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-ink/30 focus:outline-none transition-colors duration-200";

export function LoginForm() {
  const t = useTranslations("connexion");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <GlassPanel className="connexion-card mx-auto max-w-md rounded-3xl p-8 text-left">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        <input
          name="email"
          type="email"
          required
          placeholder={t("email")}
          className={fieldClass}
        />
        <input
          name="password"
          type="password"
          required
          placeholder={t("password")}
          className={fieldClass}
        />

        {state.status === "error" && (
          <p className="text-sm text-ink-soft">{t("error")}</p>
        )}

        <Link href="/mot-de-passe-oublie" className="self-center text-xs font-medium text-ink-soft hover:text-ink">
          {t("forgotPasswordLink")}
        </Link>

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
