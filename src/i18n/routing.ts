import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "zh"],
  defaultLocale: "fr",
  localeCookie: {
    name: "INO_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type AppLocale = (typeof routing.locales)[number];
