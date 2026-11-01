import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { RevealText } from "@/components/ui/RevealText";
import { DiscussionDocument } from "@/components/contrat/DiscussionDocument";
import { PrecontractApproval } from "@/components/contrat/PrecontractApproval";
import { SignaturePad } from "@/components/contrat/SignaturePad";
import { submitDiscussion, approvePrecontract, signContract } from "./actions";
import { EMPTY_CONTRACT_CONTENT, type JSONContent } from "@/lib/contract-content";

type ContractRow = {
  id: string;
  type: "discussion" | "precontract" | "signature";
  status: "draft" | "sent" | "completed";
  fields_schema: { content?: JSONContent } | null;
  pdf_path: string | null;
  projects: { name: string } | { name: string }[] | null;
};

export const instant = false;

export default async function EspaceClientContrats({
  params,
}: PageProps<"/[locale]/espace-client/contrats">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("espaceClient");
  const tc = await getTranslations("contratPage");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/connexion`);
  }

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, type, status, fields_schema, pdf_path, projects(name)")
    .order("created_at", { ascending: true });

  const admin = createSupabaseAdminClient();
  const contractList = (contracts as ContractRow[] | null) ?? [];

  const resolved = await Promise.all(
    contractList.map(async (contract) => {
      let downloadUrl: string | null = null;
      if (contract.status === "completed" && contract.pdf_path) {
        const { data } = await admin.storage.from("contract-pdfs").createSignedUrl(contract.pdf_path, 300);
        downloadUrl = data?.signedUrl ?? null;
      }
      const project = Array.isArray(contract.projects) ? contract.projects[0] : contract.projects;
      const content = contract.fields_schema?.content ?? EMPTY_CONTRACT_CONTENT;
      return { ...contract, downloadUrl, content, projectName: project?.name ?? null };
    })
  );

  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-left">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        <RevealText text={t("contracts")} stagger={35} />
      </h1>

      <div className="mt-12 flex flex-col gap-6">
        {resolved.length === 0 && (
          <GlassPanel className="rounded-3xl p-8 text-center text-ink-soft">{t("noContracts")}</GlassPanel>
        )}

        {resolved.map((contract) => (
          <GlassPanel key={contract.id} className="rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink">
                {t(`contractType.${contract.type}`)}
                {contract.projectName && <span className="font-normal text-ink-soft"> · {contract.projectName}</span>}
              </span>
              <span className="text-xs font-medium text-ink-soft">{t(`contractStatus.${contract.status}`)}</span>
            </div>

            {contract.status === "completed" && contract.downloadUrl && (
              <a href={contract.downloadUrl} className="mt-3 inline-block text-sm font-medium text-ink underline">
                {tc("downloadPdf")}
              </a>
            )}

            {contract.status === "sent" && contract.type === "discussion" && (
              <div className="mt-4">
                <DiscussionDocument
                  submitAction={submitDiscussion.bind(null, locale, contract.id)}
                  content={contract.content}
                  labels={{
                    title: tc("discussion.title"),
                    subtitle: tc("discussion.subtitle"),
                    review: tc("discussion.review"),
                    reviewTitle: tc("discussion.reviewTitle"),
                    checked: tc("discussion.checked"),
                    unchecked: tc("discussion.unchecked"),
                    back: tc("discussion.back"),
                    submit: tc("discussion.submit"),
                    submitting: tc("discussion.submitting"),
                    completed: tc("completed"),
                    downloadPdf: tc("downloadPdf"),
                  }}
                />
              </div>
            )}

            {contract.status === "sent" && contract.type === "precontract" && (
              <div className="mt-4">
                <PrecontractApproval
                  approveAction={approvePrecontract.bind(null, locale, contract.id)}
                  content={contract.content}
                  labels={{
                    title: tc("precontract.title"),
                    subtitle: tc("precontract.subtitle"),
                    approve: tc("precontract.approve"),
                    approving: tc("precontract.approving"),
                    completed: tc("completed"),
                    downloadPdf: tc("downloadPdf"),
                  }}
                />
              </div>
            )}

            {contract.status === "sent" && contract.type === "signature" && (
              <div className="mt-4">
                <SignaturePad
                  signAction={signContract.bind(null, locale, contract.id)}
                  content={contract.content}
                  labels={{
                    title: tc("signature.title"),
                    subtitle: tc("signature.subtitle"),
                    clear: tc("signature.clear"),
                    submit: tc("signature.submit"),
                    submitting: tc("signature.submitting"),
                    required: tc("signature.required"),
                    completed: tc("completed"),
                    downloadPdf: tc("downloadPdf"),
                  }}
                />
              </div>
            )}
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
