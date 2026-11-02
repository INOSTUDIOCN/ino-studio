"use client";

import dynamic from "next/dynamic";

export const ContractEditor = dynamic(
  () => import("./ContractEditor").then((mod) => mod.ContractEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[360px] rounded-2xl border border-ink/10 bg-paper/70" />
    ),
  }
);
