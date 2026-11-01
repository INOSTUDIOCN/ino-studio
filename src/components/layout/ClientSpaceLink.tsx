import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";

export async function ClientSpaceLink() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const t = await getTranslations("nav");
  const isAdmin = profile?.role === "admin";

  return (
    <Link
      href={isAdmin ? "/admin" : "/espace-client"}
      className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
    >
      {isAdmin ? t("admin") : t("clientSpace")}
    </Link>
  );
}
