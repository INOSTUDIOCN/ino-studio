import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAuthState } from "@/lib/auth-state";
import { getRequestPathname, stripLocale } from "@/lib/pathname";

const linkClass =
  "rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-ink/5 hover:text-ink";

export async function FloatingNavLinks() {
  const t = await getTranslations("nav");
  const pathname = stripLocale(await getRequestPathname());

  if (pathname.startsWith("/espace-client")) {
    return (
      <>
        <Link href="/espace-client" className={linkClass}>
          {t("projects")}
        </Link>
        <Link href="/espace-client/contrats" className={linkClass}>
          {t("contracts")}
        </Link>
      </>
    );
  }

  if (pathname.startsWith("/admin")) {
    return (
      <>
        <Link href="/admin" className={linkClass}>
          {t("clients")}
        </Link>
        <Link href="/admin/projects" className={linkClass}>
          {t("projects")}
        </Link>
        <Link href="/admin/contracts" className={linkClass}>
          {t("contracts")}
        </Link>
      </>
    );
  }

  const { user, role } = await getAuthState();

  return (
    <>
      <Link href="/" className={linkClass}>
        {t("home")}
      </Link>
      <Link href="/services" className={linkClass}>
        {t("services")}
      </Link>
      <Link href="/devis" className={linkClass}>
        {t("quote")}
      </Link>
      {user && (
        <Link href={role === "admin" ? "/admin" : "/espace-client"} className={linkClass}>
          {role === "admin" ? t("admin") : t("clientSpace")}
        </Link>
      )}
    </>
  );
}
