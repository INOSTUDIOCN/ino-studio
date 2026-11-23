import { notFound } from "next/navigation";
import Image from "next/image";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BreathingBackground } from "@/components/background/BreathingBackground";
import { RevealText } from "@/components/ui/RevealText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { DiscussionDocument } from "@/components/contrat/DiscussionDocument";
import { PrecontractApproval } from "@/components/contrat/PrecontractApproval";
import { SignaturePad } from "@/components/contrat/SignaturePad";
import { ContratLanguageSwitch } from "@/components/contrat/ContratLanguageSwitch";
import { submitDiscussion, approvePrecontract, signContract } from "./actions";
import { EMPTY_CONTRACT_CONTENT, type JSONContent } from "@/lib/contract-content";

export const instant = false;

type ContractData = {
  id: string;
  type: "discussion" | "precontract" | "signature";
  status: "draft" | "sent" | "completed";
  locale: "fr" | "zh";
  fields_schema: { content?: JSONContent } | null;
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
  const contentLocale = typedContract.locale === "zh" ? "zh" : "fr";
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("INO_LOCALE")?.value;
  const uiLocale = cookieLocale === "fr" || cookieLocale === "zh" ? cookieLocale : contentLocale;
  const t = await getTranslations({ locale: uiLocale, namespace: "contratPage" });
  const content = typedContract.fields_schema?.content ?? EMPTY_CONTRACT_CONTENT;

  let downloadUrl: string | null = null;
  if (typedContract.status === "completed" && typedContract.pdf_path) {
    const { data } = await admin.storage.from("contract-pdfs").createSignedUrl(typedContract.pdf_path, 300);
    downloadUrl = data?.signedUrl ?? null;
  }

  const redirectHref = `/${uiLocale}/espace-client/contrats`;

  return (
    <>
      <BreathingBackground variant="home" layer="front" cardSelector=".contrat-card" />
      <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-center">
        <Image
          src="/logo.png"
          alt="Ino Studio"
          width={490}
          height={125}
          priority
          className="relative z-20 mx-auto h-8 w-auto"
        />
        <ContratLanguageSwitch current={uiLocale} />
        <h1 className="relative z-20 mt-6 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          <RevealText text={t(`${typedContract.type}.title`)} stagger={35} />
        </h1>

        <div className="relative z-20 mt-14">
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
              <DiscussionDocument
                submitAction={submitDiscussion.bind(null, token)}
                content={content}
                redirectHref={redirectHref}
                labels={{
                  title: t("discussion.title"),
                  subtitle: t("discussion.subtitle"),
                  review: t("discussion.review"),
                  reviewTitle: t("discussion.reviewTitle"),
                  checked: t("discussion.checked"),
                  unchecked: t("discussion.unchecked"),
                  back: t("discussion.back"),
                  submit: t("discussion.submit"),
                  submitting: t("discussion.submitting"),
                  completed: t("completed"),
                  downloadPdf: t("downloadPdf"),
                  redirecting: t("redirecting"),
                  backToList: t("backToList"),
                }}
              />
            </div>
          )}

          {typedContract.status === "sent" && typedContract.type === "precontract" && (
            <div className="contrat-card">
              <PrecontractApproval
                approveAction={approvePrecontract.bind(null, token)}
                content={content}
                redirectHref={redirectHref}
                labels={{
                  title: t("precontract.title"),
                  subtitle: t("precontract.subtitle"),
                  approve: t("precontract.approve"),
                  approving: t("precontract.approving"),
                  completed: t("completed"),
                  downloadPdf: t("downloadPdf"),
                  redirecting: t("redirecting"),
                  backToList: t("backToList"),
                }}
              />
            </div>
          )}

          {typedContract.status === "sent" && typedContract.type === "signature" && (
            <div className="contrat-card">
              <SignaturePad
                signAction={signContract.bind(null, token)}
                content={content}
                redirectHref={redirectHref}
                labels={{
                  title: t("signature.title"),
                  subtitle: t("signature.subtitle"),
                  clear: t("signature.clear"),
                  submit: t("signature.submit"),
                  submitting: t("signature.submitting"),
                  required: t("signature.required"),
                  completed: t("completed"),
                  downloadPdf: t("downloadPdf"),
                  redirecting: t("redirecting"),
                  backToList: t("backToList"),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
