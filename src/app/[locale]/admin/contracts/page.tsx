import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ActionForm } from "@/components/admin/ActionForm";
import { sendContract, deleteContract } from "./actions";

type ContractRow = {
  id: string;
  type: string;
  status: string;
  locale: string;
  token: string;
  client_id: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

export const instant = false;

export default async function AdminContracts({ params }: PageProps<"/[locale]/admin/contracts">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const supabase = await createSupabaseServerClient();
  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, type, status, locale, token, client_id, profiles(full_name)")
    .order("created_at", { ascending: true });

  const contractList = (contracts as ContractRow[] | null) ?? [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-left">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t("contracts")}</h1>
      <p className="mt-3 text-ink-soft">{t("contractsHint")}</p>

      <ul className="mt-10 flex flex-col gap-3">
        {contractList.map((contract) => {
          const client = Array.isArray(contract.profiles) ? contract.profiles[0] : contract.profiles;
          return (
            <li key={contract.id} className="rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href={`/admin/clients/${contract.client_id}`} className="text-sm text-ink hover:underline">
                  {t(`contractType.${contract.type}`)} ({contract.locale})
                  <span className="text-ink-soft"> · {client?.full_name}</span>
                </Link>
                <span className="text-xs font-medium text-ink-soft">{t(`contractStatus.${contract.status}`)}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {contract.status === "draft" && (
                  <ActionForm
                    action={sendContract.bind(null, locale, contract.id)}
                    successMessage={t("toasts.contractSent")}
                  >
                    <button
                      type="submit"
                      className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
                    >
                      {t("send")}
                    </button>
                  </ActionForm>
                )}
                <DeleteButton
                  action={deleteContract.bind(null, locale, contract.id)}
                  label={t("delete")}
                  confirmMessage={t("deleteConfirm")}
                  successMessage={t("toasts.contractDeleted")}
                />
              </div>
              {contract.status !== "draft" && (
                <p className="mt-2 break-all text-xs text-ink-soft">
                  {siteUrl}/contrat/{contract.token}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
