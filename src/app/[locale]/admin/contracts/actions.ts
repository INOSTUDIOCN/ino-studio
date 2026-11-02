"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function sendContract(locale: string, contractId: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contracts").update({ status: "sent" }).eq("id", contractId);
  if (error) throw new Error(error.message);
  revalidatePath(`/${locale}/admin/contracts`);
}

export async function deleteContract(locale: string, contractId: string) {
  const admin = createSupabaseAdminClient();

  const { data: contract } = await admin.from("contracts").select("pdf_path").eq("id", contractId).single();
  if (contract?.pdf_path) {
    await admin.storage.from("contract-pdfs").remove([contract.pdf_path]);
  }

  const { error } = await admin.from("contracts").delete().eq("id", contractId);
  if (error) throw new Error(error.message);

  revalidatePath(`/${locale}/admin/contracts`);
}
