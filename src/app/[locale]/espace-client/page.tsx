import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { RevealText } from "@/components/ui/RevealText";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ValidateStepButton } from "@/components/espace-client/ValidateStepButton";
import { BreathingBackground } from "@/components/background/BreathingBackground";
import { logout } from "./actions";

type StepRow = { id: string; label: string; position: number; status: string };
type FileRow = { id: string; name: string; storage_path: string };
type ContractRow = { id: string; type: string; status: string };

export const instant = false;

export default async function EspaceClient({ params }: PageProps<"/[locale]/espace-client">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("espaceClient");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/connexion`);
  }

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, name, status, project_steps(id, label, position, status), project_files(id, name, storage_path), contracts(id, type, status)"
    )
    .order("created_at", { ascending: true });

  const admin = createSupabaseAdminClient();

  const resolvedProjects = await Promise.all(
    (projects ?? []).map(async (project) => {
      const files = await Promise.all(
        ((project.project_files as FileRow[] | null) ?? []).map(async (file) => {
          const { data } = await admin.storage.from("client-files").createSignedUrl(file.storage_path, 60);
          return { ...file, url: data?.signedUrl ?? null };
        })
      );
      const steps = [...((project.project_steps as StepRow[] | null) ?? [])].sort(
        (a, b) => a.position - b.position
      );
      const contracts = (project.contracts as ContractRow[] | null) ?? [];
      return { ...project, project_files: files, project_steps: steps, contracts };
    })
  );

  return (
    <>
      <BreathingBackground variant="home" />
      <div className="mx-auto max-w-4xl px-4 pt-16 pb-20">
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            <RevealText text={t("title")} stagger={35} />
          </h1>
          <form action={logout}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-paper"
            >
              {t("logout")}
            </button>
          </form>
        </div>
        <p className="relative z-20 mt-3 text-ink-soft">{t("subtitle")}</p>

        <div className="relative z-20 mt-12 flex flex-col gap-8">
          {resolvedProjects.length === 0 && (
            <GlassPanel className="rounded-3xl p-8 text-center text-ink-soft">{t("empty")}</GlassPanel>
          )}

          {resolvedProjects.map((project) => (
            <GlassPanel key={project.id} className="rounded-3xl p-8 text-left">
              <h2 className="font-display text-xl font-semibold text-ink">{project.name}</h2>

              <div className="mt-6">
                <h3 className="text-sm font-semibold tracking-wide text-ink-soft uppercase">{t("steps")}</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {project.project_steps.map((step) => (
                    <li
                      key={step.id}
                      className="flex items-center justify-between rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3"
                    >
                      <span className="text-sm text-ink">{step.label}</span>
                      {step.status === "awaiting_client" ? (
                        <ValidateStepButton
                          stepId={step.id}
                          label={t("validate")}
                          pendingLabel={t("validating")}
                        />
                      ) : (
                        <span className="text-xs font-medium text-ink-soft">
                          {t(`stepStatus.${step.status}`)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold tracking-wide text-ink-soft uppercase">{t("files")}</h3>
                {project.project_files.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-soft">{t("noFiles")}</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-2">
                    {project.project_files.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3"
                      >
                        <span className="text-sm text-ink">{file.name}</span>
                        {file.url && (
                          <a href={file.url} className="text-sm font-medium text-ink underline">
                            {t("download")}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold tracking-wide text-ink-soft uppercase">{t("contracts")}</h3>
                {project.contracts.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-soft">{t("noContracts")}</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-2">
                    {project.contracts.map((contract) => (
                      <li
                        key={contract.id}
                        className="flex items-center justify-between rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3"
                      >
                        <span className="text-sm text-ink">{t(`contractType.${contract.type}`)}</span>
                        <span className="text-xs font-medium text-ink-soft">
                          {t(`contractStatus.${contract.status}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </>
  );
}
