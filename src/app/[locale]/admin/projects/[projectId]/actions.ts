"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function addStep(locale: string, projectId: string, formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  if (!label) throw new Error("Champ manquant");

  const admin = createSupabaseAdminClient();
  const { count } = await admin
    .from("project_steps")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  await admin.from("project_steps").insert({
    project_id: projectId,
    label,
    position: count ?? 0,
  });

  revalidatePath(`/${locale}/admin/projects/${projectId}`);
}

export async function setStepStatus(locale: string, projectId: string, stepId: string, status: string) {
  const admin = createSupabaseAdminClient();
  await admin.from("project_steps").update({ status }).eq("id", stepId);
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

  await admin.from("project_files").insert({
    project_id: projectId,
    name: file.name,
    storage_path: storagePath,
  });

  revalidatePath(`/${locale}/admin/projects/${projectId}`);
}

export async function createContract(locale: string, projectId: string, clientId: string, formData: FormData) {
  const type = String(formData.get("type") ?? "");
  const contractLocale = String(formData.get("contractLocale") ?? "fr");

  let fieldsSchema: unknown;

  if (type === "discussion") {
    const raw = String(formData.get("options") ?? "");
    fieldsSchema = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } else if (type === "precontract") {
    fieldsSchema = { summary: String(formData.get("summary") ?? "").trim() };
  } else if (type === "signature") {
    fieldsSchema = { body: String(formData.get("body") ?? "").trim() };
  } else {
    throw new Error("Type de contrat invalide");
  }

  const admin = createSupabaseAdminClient();
  await admin.from("contracts").insert({
    project_id: projectId,
    client_id: clientId,
    type,
    locale: contractLocale,
    fields_schema: fieldsSchema,
  });

  revalidatePath(`/${locale}/admin/projects/${projectId}`);
}

export async function sendContract(locale: string, projectId: string, contractId: string) {
  const admin = createSupabaseAdminClient();
  await admin.from("contracts").update({ status: "sent" }).eq("id", contractId);
  revalidatePath(`/${locale}/admin/projects/${projectId}`);
}
