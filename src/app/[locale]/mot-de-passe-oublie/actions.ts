"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ForgotPasswordState = {
  status: "idle" | "success" | "error";
};

export async function requestPasswordReset(
  locale: string,
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { status: "error" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createSupabaseServerClient();

  // On renvoie toujours un succès, qu'un compte existe ou non avec cet email,
  // pour ne pas révéler si une adresse est enregistrée.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/${locale}/reinitialiser-mot-de-passe`,
  });

  return { status: "success" };
}
