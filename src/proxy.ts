import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const intlMiddleware = createMiddleware(routing);
const PROTECTED_SEGMENTS = new Set(["espace-client", "admin"]);

function withPathname(response: NextResponse, pathname: string) {
  response.headers.set("x-pathname", pathname);
  return response;
}

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/contrat")) {
    return withPathname(NextResponse.next(), pathname);
  }

  const intlResponse = intlMiddleware(request);

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  const segments = pathname.split("/").filter(Boolean);
  const [locale, section] = segments;

  if (!section || !PROTECTED_SEGMENTS.has(section)) {
    return withPathname(intlResponse, pathname);
  }

  let response = intlResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return withPathname(NextResponse.redirect(new URL(`/${locale}/connexion`, request.url)), pathname);
  }

  if (section === "admin") {
    const adminSupabase = createSupabaseAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return withPathname(
        NextResponse.redirect(new URL(`/${locale}/espace-client`, request.url)),
        pathname
      );
    }
  }

  return withPathname(response, pathname);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
