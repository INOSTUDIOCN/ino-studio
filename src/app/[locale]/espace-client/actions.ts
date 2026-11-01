"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function validateStep(locale: string, stepId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const admin = createSupabaseAdminClient();
  const { data: step } = await admin
    .from("project_steps")
    .select("id, status, project_id, projects(client_id)")
    .eq("id", stepId)
    .single();

  const project = Array.isArray(step?.projects) ? step?.projects[0] : step?.projects;

  if (!step || step.status !== "awaiting_client" || project?.client_id !== user.id) {
    throw new Error("Cannot validate this step");
  }

  await admin.from("project_steps").update({ status: "done" }).eq("id", stepId);
  revalidatePath(`/${locale}/espace-client`);
}
