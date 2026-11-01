import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { createClientAccount } from "./actions";

type ProfileRow = { id: string; full_name: string; email: string; role: string };

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

  const clients = (profiles as ProfileRow[] | null)?.filter((p) => p.role === "client") ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-left">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-ink-soft">{t("subtitle")}</p>

      <GlassPanel className="mt-10 rounded-3xl p-8">
        <h2 className="font-display text-lg font-semibold text-ink">{t("newClient")}</h2>
        <form action={createClientAccount.bind(null, locale)} className="mt-4 flex flex-col gap-3 sm:max-w-md">
          <input name="fullName" placeholder={t("fullName")} required className={fieldClass} />
          <input name="email" type="email" placeholder={t("email")} required className={fieldClass} />
          <input name="password" type="password" placeholder={t("password")} required className={fieldClass} />
          <button
            type="submit"
            className="mt-2 self-start rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            {t("create")}
          </button>
        </form>
      </GlassPanel>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">{t("clients")}</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/admin/clients/${client.id}`}
                className="flex items-center justify-between rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3 transition-colors duration-200 hover:bg-paper"
              >
                <span className="text-sm text-ink">{client.full_name}</span>
                <span className="text-xs text-ink-soft">{client.email}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
