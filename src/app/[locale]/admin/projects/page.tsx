import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProjectRow = { id: string; name: string; status: string; profiles: { full_name: string } | { full_name: string }[] | null };

export const instant = false;

export default async function AdminProjects({ params }: PageProps<"/[locale]/admin/projects">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const supabase = await createSupabaseServerClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, profiles(full_name)")
    .order("created_at", { ascending: true });

  const projectList = (projects as ProjectRow[] | null) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-left">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t("projects")}</h1>
      <p className="mt-3 text-ink-soft">{t("projectsHint")}</p>

      <ul className="mt-10 flex flex-col gap-2">
        {projectList.map((project) => {
          const client = Array.isArray(project.profiles) ? project.profiles[0] : project.profiles;
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
  );
}
