"use server";

import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type DevisFormState = {
  status: "idle" | "success" | "error";
};

const MIN_FILL_TIME_MS = 2500;
const MAX_REQUESTS_PER_HOUR = 3;

export async function submitDevisRequest(
  _prevState: DevisFormState,
  formData: FormData
): Promise<DevisFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const honeypot = String(formData.get("company") ?? "").trim();
  const loadedAt = Number(formData.get("loadedAt") ?? 0);

  if (!name || !email || !service || !message) {
    return { status: "error" };
  }

  // Honeypot rempli : un humain ne voit jamais ce champ. On fait semblant
  // que ça a marché pour ne pas indiquer au bot qu'il a été repéré.
  if (honeypot) {
    return { status: "success" };
  }

  if (!loadedAt || Date.now() - loadedAt < MIN_FILL_TIME_MS) {
    return { status: "success" };
  }

  try {
    const admin = createSupabaseAdminClient();
    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("devis_requests")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ipAddress)
      .gte("created_at", oneHourAgo);

    if ((count ?? 0) >= MAX_REQUESTS_PER_HOUR) {
      return { status: "error" };
    }

    const { error } = await admin.from("devis_requests").insert({ name, email, service, message, ip_address: ipAddress });

    if (error) {
      console.error("Supabase insert error", error.message);
      return { status: "error" };
    }

    return { status: "success" };
  } catch (err) {
    console.error("Devis submission error", err);
    return { status: "error" };
  }
}
