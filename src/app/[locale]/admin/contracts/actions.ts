"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { contractReadyEmail } from "@/lib/email/templates";
import type { ActionResult } from "@/lib/admin/action-result";

export async function sendContract(locale: string, contractId: string): Promise<ActionResult> {
  const admin = createSupabaseAdminClient();
  const { data: contract, error } = await admin
    .from("contracts")
    .update({ status: "sent" })
    .eq("id", contractId)
    .select("client_id")
    .single();
  if (error) return { status: "error", message: error.message };

  const { data: client } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", contract.client_id)
    .single();
  if (client) {
    const { subject, html } = contractReadyEmail(client.full_name);
    await sendEmail({ to: client.email, subject, html });
  }

  revalidatePath(`/${locale}/admin/contracts`);
  return { status: "success" };
}

export async function deleteContract(locale: string, contractId: string): Promise<ActionResult> {
  const admin = createSupabaseAdminClient();

  const { data: contract } = await admin.from("contracts").select("pdf_path").eq("id", contractId).single();
  if (contract?.pdf_path) {
    await admin.storage.from("contract-pdfs").remove([contract.pdf_path]);
  }

  const { error } = await admin.from("contracts").delete().eq("id", contractId);
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/${locale}/admin/contracts`);
  return { status: "success" };
}
