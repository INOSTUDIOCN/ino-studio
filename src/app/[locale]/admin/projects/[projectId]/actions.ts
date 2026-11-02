"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { stepAwaitingValidationEmail } from "@/lib/email/templates";

export async function addStep(locale: string, projectId: string, formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  if (!label) throw new Error("Champ manquant");

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
  if (error) throw new Error(error.message);

  revalidatePath(`/${locale}/admin/projects/${projectId}`);
}

export async function setStepStatus(locale: string, projectId: string, stepId: string, status: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("project_steps").update({ status }).eq("id", stepId);
  if (error) throw new Error(error.message);

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
}

export async function uploadFile(locale: string, projectId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Fichier manquant");
  }

  const admin = createSupabaseAdminClient();
  const storagePath = `${projectId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await admin.storage
    .from("client-files")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: insertError } = await admin.from("project_files").insert({
    project_id: projectId,
    name: file.name,
    storage_path: storagePath,
  });
  if (insertError) throw new Error(insertError.message);

  revalidatePath(`/${locale}/admin/projects/${projectId}`);
}
