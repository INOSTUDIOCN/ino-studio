import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { RevealText } from "@/components/ui/RevealText";

type ContractRow = {
  id: string;
  type: "discussion" | "precontract" | "signature";
  status: "draft" | "sent" | "completed";
  token: string;
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
    .select("id, type, status, token, pdf_path, projects(name)")
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
      return { ...contract, downloadUrl, projectName: project?.name ?? null };
    })
  );

  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-left">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        <RevealText text={t("contracts")} stagger={35} />
      </h1>

      <div className="mt-12 flex flex-col gap-3">
        {resolved.length === 0 && (
          <GlassPanel className="rounded-3xl p-8 text-center text-ink-soft">{t("noContracts")}</GlassPanel>
        )}

        {resolved.map((contract) => {
          const isActionable = contract.status === "sent";
          const row = (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink">
                {t(`contractType.${contract.type}`)}
                {contract.projectName && <span className="font-normal text-ink-soft"> · {contract.projectName}</span>}
              </span>
              <span className="text-xs font-medium text-ink-soft">
                {contract.status === "sent" ? t("openContract") : t(`contractStatus.${contract.status}`)}
              </span>
            </div>
          );

          return (
            <GlassPanel key={contract.id} className="rounded-3xl p-6">
              {isActionable ? (
                <a href={`/contrat/${contract.token}`} className="block transition-opacity duration-200 hover:opacity-70">
                  {row}
                </a>
              ) : (
                row
              )}

              {contract.status === "completed" && contract.downloadUrl && (
                <a href={contract.downloadUrl} className="mt-3 inline-block text-sm font-medium text-ink underline">
                  {tc("downloadPdf")}
                </a>
              )}
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}
