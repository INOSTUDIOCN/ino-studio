"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function sendContract(locale: string, contractId: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contracts").update({ status: "sent" }).eq("id", contractId);
  if (error) throw new Error(error.message);
  revalidatePath(`/${locale}/admin/contracts`);
}
