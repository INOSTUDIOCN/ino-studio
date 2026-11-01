"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasTaskItem, isContentEmpty, type JSONContent } from "@/lib/contract-content";

export async function createProjectForClient(locale: string, clientId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Champ manquant");

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("projects").insert({ client_id: clientId, name });
  if (error) throw new Error(error.message);

  revalidatePath(`/${locale}/admin/clients/${clientId}`);
  revalidatePath(`/${locale}/admin/projects`);
}

export async function createContractForClient(locale: string, clientId: string, formData: FormData) {
  const type = String(formData.get("type") ?? "");
  const contractLocale = String(formData.get("contractLocale") ?? "fr");
  const projectId = String(formData.get("projectId") ?? "") || null;
  const rawContent = String(formData.get("content") ?? "");

  if (!["discussion", "precontract", "signature"].includes(type)) {
    throw new Error("Type de contrat invalide");
  }

  let content: JSONContent;
  try {
    content = JSON.parse(rawContent);
  } catch {
    throw new Error("Contenu du contrat invalide");
  }

  if (isContentEmpty(content)) {
    throw new Error("Le contenu du contrat ne peut pas être vide.");
  }

  if (type === "discussion" && !hasTaskItem(content)) {
    throw new Error("Ajoute au moins une case à cocher pour un contrat de discussion.");
  }

  const admin = createSupabaseAdminClient();

  if (projectId) {
    const { data: project } = await admin.from("projects").select("client_id").eq("id", projectId).single();
    if (!project || project.client_id !== clientId) {
      throw new Error("Projet invalide pour ce client");
    }
  }

  const { error } = await admin.from("contracts").insert({
    project_id: projectId,
    client_id: clientId,
    type,
    locale: contractLocale,
    fields_schema: { content },
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/${locale}/admin/clients/${clientId}`);
  revalidatePath(`/${locale}/admin/contracts`);
}

export async function sendContractForClient(locale: string, clientId: string, contractId: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contracts").update({ status: "sent" }).eq("id", contractId);
  if (error) throw new Error(error.message);
  revalidatePath(`/${locale}/admin/clients/${clientId}`);
  revalidatePath(`/${locale}/admin/contracts`);
}
