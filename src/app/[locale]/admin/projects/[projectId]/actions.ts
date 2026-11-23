"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { stepAwaitingValidationEmail } from "@/lib/email/templates";
import type { ActionResult } from "@/lib/admin/action-result";

export async function addStep(locale: string, projectId: string, formData: FormData): Promise<ActionResult> {
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return { status: "error", message: "Champ manquant" };

  const admin = createSupabaseAdminClient();
  const { count } = await admin
    .from("project_steps")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { error } = await admin.from("project_steps").insert({
    project_id: projectId,
    label,
    position: count ?? 0,
  });
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/${locale}/admin/projects/${projectId}`);
  return { status: "success" };
}

export async function setStepStatus(
  locale: string,
  projectId: string,
  stepId: string,
  status: string
): Promise<ActionResult> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("project_steps").update({ status }).eq("id", stepId);
  if (error) return { status: "error", message: error.message };

  if (status === "awaiting_client") {
    const { data: project } = await admin
      .from("projects")
      .select("name, profiles(full_name, email)")
      .eq("id", projectId)
      .single();
    const client = Array.isArray(project?.profiles) ? project?.profiles[0] : project?.profiles;
    if (project && client) {
      const { subject, html } = stepAwaitingValidationEmail(client.full_name, project.name);
      await sendEmail({ to: client.email, subject, html });
    }
  }

  revalidatePath(`/${locale}/admin/projects/${projectId}`);
  return { status: "success" };
}

export async function uploadFile(locale: string, projectId: string, formData: FormData): Promise<ActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Fichier manquant" };
  }

  const admin = createSupabaseAdminClient();
  const storagePath = `${projectId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await admin.storage
    .from("client-files")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return { status: "error", message: uploadError.message };
  }

  const { error: insertError } = await admin.from("project_files").insert({
    project_id: projectId,
    name: file.name,
    storage_path: storagePath,
  });
  if (insertError) return { status: "error", message: insertError.message };

  revalidatePath(`/${locale}/admin/projects/${projectId}`);
  return { status: "success" };
}
