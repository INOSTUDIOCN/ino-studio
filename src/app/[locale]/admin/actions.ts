"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { clientAccountCreatedEmail } from "@/lib/email/templates";
import type { ActionResult } from "@/lib/admin/action-result";

export async function createClientAccount(locale: string, formData: FormData): Promise<ActionResult> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { status: "error", message: "Champs manquants" };
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return { status: "error", message: error?.message ?? "Création du compte impossible" };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    role: "client",
    full_name: fullName,
    email,
  });
  if (profileError) return { status: "error", message: profileError.message };

  const { subject, html } = clientAccountCreatedEmail(fullName);
  await sendEmail({ to: email, subject, html });

  revalidatePath(`/${locale}/admin`);
  return { status: "success" };
}
