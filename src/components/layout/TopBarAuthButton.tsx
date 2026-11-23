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
        className="whitespace-nowrap rounded-full border border-ink/10 bg-paper/70 px-3 py-1.5 text-xs font-medium text-ink transition-colors duration-200 hover:bg-paper sm:px-4 sm:py-2 sm:text-sm"
      >
        {t("login")}
      </Link>
    );
  }

  return (
    <form action={logout.bind(null, locale)}>
      <button
        type="submit"
        className="whitespace-nowrap rounded-full border border-ink/10 bg-paper/70 px-3 py-1.5 text-xs font-medium text-ink transition-colors duration-200 hover:bg-paper sm:px-4 sm:py-2 sm:text-sm"
      >
        {t("logout")}
      </button>
    </form>
  );
}
