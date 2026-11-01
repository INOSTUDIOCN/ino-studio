import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAuthState } from "@/lib/auth-state";
import { getRequestPathname, stripLocale } from "@/lib/pathname";

export async function TopBarLogo() {
  const t = await getTranslations("topbar");
  const pathname = stripLocale(await getRequestPathname());
  const isDashboard = pathname.startsWith("/espace-client") || pathname.startsWith("/admin");

  let href = "/";
  if (isDashboard) {
    const { role } = await getAuthState();
    href = role === "admin" ? "/admin" : "/espace-client";
  }

  return (
    <Link href={href} aria-label={t("homeAria")} className="flex items-center">
      <Image src="/logo.png" alt="Ino Studio" width={490} height={125} priority className="h-7 w-auto" />
    </Link>
  );
}
