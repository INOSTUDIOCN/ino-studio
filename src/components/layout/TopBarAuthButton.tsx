import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAuthState } from "@/lib/auth-state";
import { logout } from "@/app/auth-actions";

export async function TopBarAuthButton() {
  const t = await getTranslations("topbar");
  const locale = await getLocale();
  const { user } = await getAuthState();

  if (!user) {
    return (
      <Link
        href="/connexion"
        className="rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-paper"
      >
        {t("login")}
      </Link>
    );
  }

  return (
    <form action={logout.bind(null, locale)}>
      <button
        type="submit"
        className="rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-paper"
      >
        {t("logout")}
      </button>
    </form>
  );
}
