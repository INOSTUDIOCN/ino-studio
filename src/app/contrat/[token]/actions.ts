"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderContractPdf } from "@/lib/pdf/contract";

export async function submitDiscussion(token: string, selected: string[]) {
  const admin = createSupabaseAdminClient();
  const { data: contract } = await admin
    .from("contracts")
    .select("id, status, type")
    .eq("token", token)
    .single();

  if (!contract || contract.type !== "discussion" || contract.status !== "sent") {
    throw new Error("Contrat invalide");
  }

  await admin
    .from("contracts")
    .update({ responses: { selected }, status: "completed" })
    .eq("id", contract.id);
}

export async function approvePrecontract(token: string) {
  const admin = createSupabaseAdminClient();
  const { data: contract } = await admin
    .from("contracts")
    .select("id, status, type")
    .eq("token", token)
    .single();

  if (!contract || contract.type !== "precontract" || contract.status !== "sent") {
    throw new Error("Contrat invalide");
  }

  await admin
    .from("contracts")
    .update({ responses: { approved: true }, status: "completed" })
    .eq("id", contract.id);
}

export async function signContract(token: string, signatureDataUrl: string) {
  const admin = createSupabaseAdminClient();
  const { data: contract } = await admin
    .from("contracts")
    .select("id, status, type, locale, fields_schema, profiles(full_name)")
    .eq("token", token)
    .single();

  const client = Array.isArray(contract?.profiles) ? contract?.profiles[0] : contract?.profiles;

  if (!contract || contract.type !== "signature" || contract.status !== "sent" || !client) {
    throw new Error("Contrat invalide");
  }

  const contractLocale = contract.locale === "zh" ? "zh" : "fr";
  const headerList = await headers();
  const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const signedAt = new Date();
  const t = await getTranslations({ locale: contractLocale, namespace: "contratPage" });
  const body = (contract.fields_schema as { body?: string } | null)?.body ?? "";

  const pdfBuffer = await renderContractPdf({
    title: t("pdfTitle"),
    clientName: client.full_name,
    body,
    signatureDataUrl,
    signedAtLabel: `${t("pdfSignedAt")} ${signedAt.toLocaleString(contractLocale === "zh" ? "zh-CN" : "fr-FR")}`,
    ipAddress: `${t("pdfIp")} ${ipAddress}`,
    locale: contractLocale,
  });

  const sha256Hash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");
  const pdfPath = `${contract.id}.pdf`;

  await admin.storage
    .from("contract-pdfs")
    .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });

  await admin
    .from("contracts")
    .update({
      status: "completed",
      signature_data: signatureDataUrl,
      signed_at: signedAt.toISOString(),
      sha256_hash: sha256Hash,
      ip_address: ipAddress,
      pdf_path: pdfPath,
    })
    .eq("id", contract.id);
}
