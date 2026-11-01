import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { createClientAccount, createProject } from "./actions";

type ProfileRow = { id: string; full_name: string; email: string; role: string };
type ProjectRow = { id: string; name: string; status: string; client_id: string };

const fieldClass =
  "w-full rounded-2xl border border-ink/10 bg-paper/70 px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-ink/30 focus:outline-none transition-colors duration-200";

export const instant = false;

export default async function Admin({ params }: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const supabase = await createSupabaseServerClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .order("full_name", { ascending: true });
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, client_id")
    .order("created_at", { ascending: true });

  const clients = (profiles as ProfileRow[] | null)?.filter((p) => p.role === "client") ?? [];
  const projectList = (projects as ProjectRow[] | null) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 pb-20">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-ink-soft">{t("subtitle")}</p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <GlassPanel className="rounded-3xl p-8 text-left">
          <h2 className="font-display text-lg font-semibold text-ink">{t("newClient")}</h2>
          <form action={createClientAccount.bind(null, locale)} className="mt-4 flex flex-col gap-3">
            <input name="fullName" placeholder={t("fullName")} required className={fieldClass} />
            <input name="email" type="email" placeholder={t("email")} required className={fieldClass} />
            <input name="password" type="password" placeholder={t("password")} required className={fieldClass} />
            <button
              type="submit"
              className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
            >
              {t("create")}
            </button>
          </form>
        </GlassPanel>

        <GlassPanel className="rounded-3xl p-8 text-left">
          <h2 className="font-display text-lg font-semibold text-ink">{t("newProject")}</h2>
          <form action={createProject.bind(null, locale)} className="mt-4 flex flex-col gap-3">
            <select name="clientId" required className={fieldClass}>
              <option value="">{t("selectClient")}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name} ({client.email})
                </option>
              ))}
            </select>
            <input name="name" placeholder={t("projectName")} required className={fieldClass} />
            <button
              type="submit"
              className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
            >
              {t("create")}
            </button>
          </form>
        </GlassPanel>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-lg font-semibold text-ink">{t("projects")}</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {projectList.map((project) => {
            const client = clients.find((c) => c.id === project.client_id);
            return (
              <li key={project.id}>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="flex items-center justify-between rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3 transition-colors duration-200 hover:bg-paper"
                >
                  <span className="text-sm text-ink">
                    {project.name} <span className="text-ink-soft">{client?.full_name}</span>
                  </span>
                  <span className="text-xs font-medium text-ink-soft">{project.status}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
