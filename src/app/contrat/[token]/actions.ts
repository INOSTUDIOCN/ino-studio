"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderContractPdf } from "@/lib/pdf/contract";
import type { JSONContent } from "@/lib/contract-content";

async function generateAndStorePdf(
  contractId: string,
  title: string,
  content: JSONContent,
  locale: "fr" | "zh",
  checkedLabels?: string[]
) {
  const admin = createSupabaseAdminClient();
  const pdfBuffer = await renderContractPdf({ title, content, checkedLabels, locale });
  const pdfPath = `${contractId}.pdf`;
  await admin.storage
    .from("contract-pdfs")
    .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });
  return pdfPath;
}

async function signedPdfUrl(pdfPath: string | null) {
  if (!pdfPath) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin.storage.from("contract-pdfs").createSignedUrl(pdfPath, 300);
  return data?.signedUrl ?? null;
}

export async function submitDiscussion(token: string, selected: string[]) {
  const admin = createSupabaseAdminClient();
  const { data: contract } = await admin
    .from("contracts")
    .select("id, status, type, locale, fields_schema")
    .eq("token", token)
    .single();

  if (!contract || contract.type !== "discussion" || contract.status !== "sent") {
    throw new Error("Contrat invalide");
  }

  const contractLocale = contract.locale === "zh" ? "zh" : "fr";
  const t = await getTranslations({ locale: contractLocale, namespace: "contratPage" });
  const content = (contract.fields_schema as { content?: JSONContent } | null)?.content;
  const pdfPath = content
    ? await generateAndStorePdf(contract.id, t("discussion.title"), content, contractLocale, selected)
    : null;

  await admin
    .from("contracts")
    .update({ responses: { selected }, status: "completed", pdf_path: pdfPath })
    .eq("id", contract.id);

  return { downloadUrl: await signedPdfUrl(pdfPath) };
}

export async function approvePrecontract(token: string) {
  const admin = createSupabaseAdminClient();
  const { data: contract } = await admin
    .from("contracts")
    .select("id, status, type, locale, fields_schema")
    .eq("token", token)
    .single();

  if (!contract || contract.type !== "precontract" || contract.status !== "sent") {
    throw new Error("Contrat invalide");
  }

  const contractLocale = contract.locale === "zh" ? "zh" : "fr";
  const t = await getTranslations({ locale: contractLocale, namespace: "contratPage" });
  const content = (contract.fields_schema as { content?: JSONContent } | null)?.content;
  const pdfPath = content
    ? await generateAndStorePdf(contract.id, t("precontract.title"), content, contractLocale)
    : null;

  await admin
    .from("contracts")
    .update({ responses: { approved: true }, status: "completed", pdf_path: pdfPath })
    .eq("id", contract.id);

  return { downloadUrl: await signedPdfUrl(pdfPath) };
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
  const content = (contract.fields_schema as { content?: JSONContent } | null)?.content ?? {
    type: "doc",
    content: [],
  };

  const pdfBuffer = await renderContractPdf({
    title: t("signature.title"),
    content,
    locale: contractLocale,
    signature: {
      clientName: client.full_name,
      signatureDataUrl,
      signedAtLabel: `${t("pdfSignedAt")} ${signedAt.toLocaleString(contractLocale === "zh" ? "zh-CN" : "fr-FR")}`,
      ipAddress: `${t("pdfIp")} ${ipAddress}`,
    },
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

  return { downloadUrl: await signedPdfUrl(pdfPath) };
}
