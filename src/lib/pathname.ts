import { headers } from "next/headers";

export async function getRequestPathname() {
  const headerList = await headers();
  return headerList.get("x-pathname") ?? "/";
}

export function stripLocale(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  segments.shift();
  return `/${segments.join("/")}`;
}
