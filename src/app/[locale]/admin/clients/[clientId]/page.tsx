import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { ContractEditor } from "@/components/admin/ContractEditorLoader";
import { createProjectForClient, createContractForClient, sendContractForClient } from "./actions";

type ProjectRow = { id: string; name: string; status: string };
type ContractRow = { id: string; type: string; status: string; token: string; locale: string; project_id: string | null };

const fieldClass =
  "w-full rounded-2xl border border-ink/10 bg-paper/70 px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-ink/30 focus:outline-none transition-colors duration-200";

export const instant = false;

export default async function AdminClient({
  params,
}: PageProps<"/[locale]/admin/clients/[clientId]">) {
  const { locale, clientId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const supabase = await createSupabaseServerClient();
  const { data: client } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", clientId)
    .single();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, type, status, token, locale, project_id")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  if (!client) {
    return null;
  }

  const projectList = (projects as ProjectRow[] | null) ?? [];
  const contractList = (contracts as ContractRow[] | null) ?? [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-left">
      <Link href="/admin" className="text-sm font-medium text-ink-soft hover:text-ink">
        {t("back")}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {client.full_name}
      </h1>
      <p className="mt-2 text-ink-soft">{client.email}</p>

      <GlassPanel className="mt-10 rounded-3xl p-8">
        <h2 className="font-display text-lg font-semibold text-ink">{t("contracts")}</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {contractList.map((contract) => (
            <li key={contract.id} className="rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-ink">
                  {t(`contractType.${contract.type}`)} ({contract.locale})
                  {contract.project_id && (
                    <span className="text-ink-soft"> · {projectList.find((p) => p.id === contract.project_id)?.name}</span>
                  )}
                </span>
                <span className="text-xs font-medium text-ink-soft">{t(`contractStatus.${contract.status}`)}</span>
              </div>
              {contract.status === "draft" && (
                <form action={sendContractForClient.bind(null, locale, clientId, contract.id)} className="mt-2">
                  <button
                    type="submit"
                    className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
                  >
                    {t("send")}
                  </button>
                </form>
              )}
              {contract.status !== "draft" && (
                <p className="mt-2 break-all text-xs text-ink-soft">
                  {siteUrl}/contrat/{contract.token}
                </p>
              )}
            </li>
          ))}
        </ul>

        <form
          action={createContractForClient.bind(null, locale, clientId)}
          className="mt-6 flex flex-col gap-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <GlassSelect
              name="type"
              placeholder={t("selectContractType")}
              required
              options={[
                { value: "discussion", label: t("contractType.discussion") },
                { value: "precontract", label: t("contractType.precontract") },
                { value: "signature", label: t("contractType.signature") },
              ]}
            />
            <GlassSelect
              name="contractLocale"
              placeholder={t("selectContractLocale")}
              defaultValue="fr"
              options={[
                { value: "fr", label: "Français" },
                { value: "zh", label: "中文" },
              ]}
            />
          </div>
          {projectList.length > 0 && (
            <GlassSelect
              name="projectId"
              placeholder={t("selectProjectOptional")}
              options={projectList.map((project) => ({ value: project.id, label: project.name }))}
            />
          )}

          <ContractEditor
            name="content"
            labels={{
              heading: t("editorHeading"),
              paragraph: t("editorParagraph"),
              bold: t("editorBold"),
              bulletList: t("editorBulletList"),
              checklist: t("editorChecklist"),
              importToggle: t("editorImportToggle"),
              importPlaceholder: t("editorImportPlaceholder"),
              importConvert: t("editorImportConvert"),
            }}
          />

          <button
            type="submit"
            className="shrink-0 self-start rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            {t("create")}
          </button>
        </form>
      </GlassPanel>

      <GlassPanel className="mt-8 rounded-3xl p-8">
        <h2 className="font-display text-lg font-semibold text-ink">{t("projects")}</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {projectList.map((project) => (
            <li key={project.id}>
              <Link
                href={`/admin/projects/${project.id}`}
                className="flex items-center justify-between rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3 transition-colors duration-200 hover:bg-paper"
              >
                <span className="text-sm text-ink">{project.name}</span>
                <span className="text-xs font-medium text-ink-soft">{project.status}</span>
              </Link>
            </li>
          ))}
        </ul>
        <form action={createProjectForClient.bind(null, locale, clientId)} className="mt-4 flex gap-3">
          <input name="name" placeholder={t("projectName")} required className={fieldClass} />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            {t("create")}
          </button>
        </form>
      </GlassPanel>
    </div>
  );
}
