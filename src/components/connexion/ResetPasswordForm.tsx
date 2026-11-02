"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const fieldClass =
  "w-full rounded-2xl border border-ink/10 bg-paper/70 px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-ink/30 focus:outline-none transition-colors duration-200";

export function ResetPasswordForm() {
  const t = useTranslations("resetPassword");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <GlassPanel className="mx-auto max-w-md rounded-3xl p-8 text-center">
        <p className="font-display text-lg font-semibold text-ink">{t("success")}</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="mx-auto max-w-md rounded-3xl p-8 text-left">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);

          if (password.length < 8) {
            setError(t("tooShort"));
            return;
          }
          if (password !== confirm) {
            setError(t("mismatch"));
            return;
          }

          setPending(true);
          try {
            const supabase = createSupabaseBrowserClient();
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) {
              setError(t("error"));
              return;
            }
            setDone(true);
            setTimeout(() => {
              router.push("/espace-client");
            }, 2500);
          } finally {
            setPending(false);
          }
        }}
        className="flex flex-col gap-4"
      >
        <input
          type="password"
          required
          placeholder={t("newPassword")}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass}
        />
        <input
          type="password"
          required
          placeholder={t("confirmPassword")}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className={fieldClass}
        />

        {error && <p className="text-sm text-ink-soft">{error}</p>}

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
