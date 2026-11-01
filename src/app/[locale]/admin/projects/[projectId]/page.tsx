import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { addStep, setStepStatus, uploadFile, createContract, sendContract } from "./actions";

type StepRow = { id: string; label: string; position: number; status: string };
type FileRow = { id: string; name: string };
type ContractRow = { id: string; type: string; status: string; token: string; locale: string };
type ProjectRow = {
  id: string;
  name: string;
  client_id: string;
  profiles: { full_name: string; email: string } | { full_name: string; email: string }[] | null;
};

const fieldClass =
  "w-full rounded-2xl border border-ink/10 bg-paper/70 px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-ink/30 focus:outline-none transition-colors duration-200";

const STEP_STATUSES = ["pending", "in_progress", "awaiting_client", "done"] as const;

export const instant = false;

export default async function AdminProject({
  params,
}: PageProps<"/[locale]/admin/projects/[projectId]">) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const supabase = await createSupabaseServerClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, client_id, profiles(full_name, email)")
    .eq("id", projectId)
    .single();

  const { data: steps } = await supabase
    .from("project_steps")
    .select("id, label, position, status")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  const { data: files } = await supabase
    .from("project_files")
    .select("id, name")
    .eq("project_id", projectId);

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, type, status, token, locale")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (!project) {
    return null;
  }

  const typedProject = project as ProjectRow;
  const client = Array.isArray(typedProject.profiles) ? typedProject.profiles[0] : typedProject.profiles;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-left">
      <Link href="/admin" className="text-sm font-medium text-ink-soft hover:text-ink">
        {t("back")}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {typedProject.name}
      </h1>
      <p className="mt-2 text-ink-soft">
        {client?.full_name} ({client?.email})
      </p>

      <GlassPanel className="mt-10 rounded-3xl p-8">
        <h2 className="font-display text-lg font-semibold text-ink">{t("steps")}</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {(steps as StepRow[] | null)?.map((step) => (
            <li
              key={step.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3"
            >
              <span className="text-sm text-ink">{step.label}</span>
              <div className="flex gap-2">
                {STEP_STATUSES.map((status) => (
                  <form key={status} action={setStepStatus.bind(null, locale, projectId, step.id, status)}>
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ${
                        step.status === status
                          ? "bg-ink text-paper"
                          : "border border-ink/10 bg-paper/70 text-ink-soft hover:text-ink"
                      }`}
                    >
                      {t(`stepStatus.${status}`)}
                    </button>
                  </form>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <form action={addStep.bind(null, locale, projectId)} className="mt-4 flex gap-3">
          <input name="label" placeholder={t("stepLabel")} required className={fieldClass} />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            {t("create")}
          </button>
        </form>
      </GlassPanel>

      <GlassPanel className="mt-8 rounded-3xl p-8">
        <h2 className="font-display text-lg font-semibold text-ink">{t("files")}</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {(files as FileRow[] | null)?.map((file) => (
            <li key={file.id} className="rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3 text-sm text-ink">
              {file.name}
            </li>
          ))}
        </ul>
        <form action={uploadFile.bind(null, locale, projectId)} className="mt-4 flex gap-3">
          <input name="file" type="file" required className={fieldClass} />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            {t("uploadFile")}
          </button>
        </form>
      </GlassPanel>

      <GlassPanel className="mt-8 rounded-3xl p-8">
        <h2 className="font-display text-lg font-semibold text-ink">{t("contracts")}</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {(contracts as ContractRow[] | null)?.map((contract) => (
            <li key={contract.id} className="rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-ink">
                  {t(`contractType.${contract.type}`)} ({contract.locale})
                </span>
                <span className="text-xs font-medium text-ink-soft">{t(`contractStatus.${contract.status}`)}</span>
              </div>
              {contract.status === "draft" && (
                <form action={sendContract.bind(null, locale, projectId, contract.id)} className="mt-2">
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
          action={createContract.bind(null, locale, projectId, typedProject.client_id)}
          className="mt-4 flex flex-col gap-3"
        >
          <select name="type" required className={fieldClass}>
            <option value="">{t("selectContractType")}</option>
            <option value="discussion">{t("contractType.discussion")}</option>
            <option value="precontract">{t("contractType.precontract")}</option>
            <option value="signature">{t("contractType.signature")}</option>
          </select>
          <select name="contractLocale" defaultValue="fr" className={fieldClass}>
            <option value="fr">Français</option>
            <option value="zh">中文</option>
          </select>
          <textarea
            name="options"
            rows={4}
            placeholder={t("optionsPlaceholder")}
            className={`${fieldClass} resize-none`}
          />
          <textarea
            name="summary"
            rows={4}
            placeholder={t("summaryPlaceholder")}
            className={`${fieldClass} resize-none`}
          />
          <textarea
            name="body"
            rows={6}
            placeholder={t("bodyPlaceholder")}
            className={`${fieldClass} resize-none`}
          />
          <button
            type="submit"
            className="shrink-0 self-start rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            {t("create")}
          </button>
        </form>
      </GlassPanel>
    </div>
  );
}
