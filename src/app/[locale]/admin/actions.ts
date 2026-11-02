"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { clientAccountCreatedEmail } from "@/lib/email/templates";

export async function createClientAccount(locale: string, formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    throw new Error("Champs manquants");
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Création du compte impossible");
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    role: "client",
    full_name: fullName,
    email,
  });
  if (profileError) throw new Error(profileError.message);

  const { subject, html } = clientAccountCreatedEmail(fullName);
  await sendEmail({ to: email, subject, html });

  revalidatePath(`/${locale}/admin`);
}
