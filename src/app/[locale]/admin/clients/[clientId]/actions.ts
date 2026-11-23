"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasTaskItem, isContentEmpty, type JSONContent } from "@/lib/contract-content";
import { sendEmail } from "@/lib/email/send";
import { contractReadyEmail } from "@/lib/email/templates";
import type { ActionResult } from "@/lib/admin/action-result";

export async function createProjectForClient(
  locale: string,
  clientId: string,
  formData: FormData
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { status: "error", message: "Champ manquant" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("projects").insert({ client_id: clientId, name });
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/${locale}/admin/clients/${clientId}`);
  revalidatePath(`/${locale}/admin/projects`);
  return { status: "success" };
}

export async function createContractForClient(
  locale: string,
  clientId: string,
  formData: FormData
): Promise<ActionResult> {
  const type = String(formData.get("type") ?? "");
  const contractLocale = String(formData.get("contractLocale") ?? "fr");
  const projectId = String(formData.get("projectId") ?? "") || null;
  const rawContent = String(formData.get("content") ?? "");
  const adminSignatureData = String(formData.get("adminSignature") ?? "");

  if (!["discussion", "precontract", "signature"].includes(type)) {
    return { status: "error", message: "Type de contrat invalide" };
  }

  if (type === "signature" && !adminSignatureData.startsWith("data:image")) {
    return { status: "error", message: "Signe le contrat avant de le créer." };
  }

  let content: JSONContent;
  try {
    content = JSON.parse(rawContent);
  } catch {
    return { status: "error", message: "Contenu du contrat invalide" };
  }

  if (isContentEmpty(content)) {
    return { status: "error", message: "Le contenu du contrat ne peut pas être vide." };
  }

  if (type === "discussion" && !hasTaskItem(content)) {
    return { status: "error", message: "Ajoute au moins une case à cocher pour un contrat de discussion." };
  }

  const admin = createSupabaseAdminClient();

  if (projectId) {
    const { data: project } = await admin.from("projects").select("client_id").eq("id", projectId).single();
    if (!project || project.client_id !== clientId) {
      return { status: "error", message: "Projet invalide pour ce client" };
    }
  }

  const { error } = await admin.from("contracts").insert({
    project_id: projectId,
    client_id: clientId,
    type,
    locale: contractLocale,
    fields_schema: { content },
    admin_signature_data: type === "signature" ? adminSignatureData : null,
  });
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/${locale}/admin/clients/${clientId}`);
  revalidatePath(`/${locale}/admin/contracts`);
  return { status: "success" };
}

export async function sendContractForClient(
  locale: string,
  clientId: string,
  contractId: string
): Promise<ActionResult> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contracts").update({ status: "sent" }).eq("id", contractId);
  if (error) return { status: "error", message: error.message };

  const { data: client } = await admin.from("profiles").select("full_name, email").eq("id", clientId).single();
  if (client) {
    const { subject, html } = contractReadyEmail(client.full_name);
    await sendEmail({ to: client.email, subject, html });
  }

  revalidatePath(`/${locale}/admin/clients/${clientId}`);
  revalidatePath(`/${locale}/admin/contracts`);
  return { status: "success" };
}

export async function deleteContractForClient(
  locale: string,
  clientId: string,
  contractId: string
): Promise<ActionResult> {
  const admin = createSupabaseAdminClient();

  const { data: contract } = await admin.from("contracts").select("pdf_path").eq("id", contractId).single();
  if (contract?.pdf_path) {
    await admin.storage.from("contract-pdfs").remove([contract.pdf_path]);
  }

  const { error } = await admin.from("contracts").delete().eq("id", contractId);
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/${locale}/admin/clients/${clientId}`);
  revalidatePath(`/${locale}/admin/contracts`);
  return { status: "success" };
}
