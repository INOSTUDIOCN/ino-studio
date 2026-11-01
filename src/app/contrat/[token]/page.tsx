import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BreathingBackground } from "@/components/background/BreathingBackground";
import { RevealText } from "@/components/ui/RevealText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { DiscussionForm } from "@/components/contrat/DiscussionForm";
import { PrecontractApproval } from "@/components/contrat/PrecontractApproval";
import { SignaturePad } from "@/components/contrat/SignaturePad";

export const instant = false;

type ContractData = {
  id: string;
  type: "discussion" | "precontract" | "signature";
  status: "draft" | "sent" | "completed";
  locale: "fr" | "zh";
  fields_schema: unknown;
  pdf_path: string | null;
};

export default async function Contrat({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const admin = createSupabaseAdminClient();
  const { data: contract } = await admin
    .from("contracts")
    .select("id, type, status, locale, fields_schema, pdf_path")
    .eq("token", token)
    .single();

  if (!contract) {
    notFound();
  }

  const typedContract = contract as ContractData;
  const locale = typedContract.locale === "zh" ? "zh" : "fr";
  const t = await getTranslations({ locale, namespace: "contratPage" });

  let downloadUrl: string | null = null;
  if (typedContract.status === "completed" && typedContract.type === "signature" && typedContract.pdf_path) {
    const { data } = await admin.storage.from("contract-pdfs").createSignedUrl(typedContract.pdf_path, 300);
    downloadUrl = data?.signedUrl ?? null;
  }

  return (
    <>
      <BreathingBackground variant="home" layer="front" cardSelector=".contrat-card" />
      <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-center">
        <h1 className="relative z-20 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          <RevealText text={t(`${typedContract.type}.title`)} stagger={35} />
        </h1>

        <div className="mt-14">
          {typedContract.status === "draft" && (
            <GlassPanel className="contrat-card mx-auto max-w-lg rounded-3xl p-8 text-center">
              <p className="text-ink-soft">{t("draft")}</p>
            </GlassPanel>
          )}

          {typedContract.status === "completed" && (
            <GlassPanel className="contrat-card mx-auto max-w-lg rounded-3xl p-8 text-center">
              <p className="text-ink-soft">{t("completed")}</p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  className="mt-4 inline-block text-sm font-medium text-ink underline"
                >
                  {t("downloadPdf")}
                </a>
              )}
            </GlassPanel>
          )}

          {typedContract.status === "sent" && typedContract.type === "discussion" && (
            <div className="contrat-card">
              <DiscussionForm
                token={token}
                options={(typedContract.fields_schema as string[]) ?? []}
                labels={{
                  title: t("discussion.title"),
                  subtitle: t("discussion.subtitle"),
                  submit: t("discussion.submit"),
                  submitting: t("discussion.submitting"),
                  completed: t("completed"),
                }}
              />
            </div>
          )}

          {typedContract.status === "sent" && typedContract.type === "precontract" && (
            <div className="contrat-card">
              <PrecontractApproval
                token={token}
                summary={(typedContract.fields_schema as { summary?: string } | null)?.summary ?? ""}
                labels={{
                  title: t("precontract.title"),
                  subtitle: t("precontract.subtitle"),
                  approve: t("precontract.approve"),
                  approving: t("precontract.approving"),
                  completed: t("completed"),
                }}
              />
            </div>
          )}

          {typedContract.status === "sent" && typedContract.type === "signature" && (
            <div className="contrat-card">
              <SignaturePad
                token={token}
                body={(typedContract.fields_schema as { body?: string } | null)?.body ?? ""}
                labels={{
                  title: t("signature.title"),
                  subtitle: t("signature.subtitle"),
                  clear: t("signature.clear"),
                  submit: t("signature.submit"),
                  submitting: t("signature.submitting"),
                  required: t("signature.required"),
                  completed: t("completed"),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
