"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DevisFormState = {
  status: "idle" | "success" | "error";
};

export async function submitDevisRequest(
  _prevState: DevisFormState,
  formData: FormData
): Promise<DevisFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !service || !message) {
    return { status: "error" };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("devis_requests")
      .insert({ name, email, service, message });

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
