import { setRequestLocale } from "next-intl/server";

export default async function Cgv({ params }: PageProps<"/[locale]/cgv">) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale === "zh") {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-20 text-left">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">一般销售条款</h1>
        <p className="mt-2 text-sm text-ink-soft">最后更新 [日期]</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-ink-soft">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">1. 适用范围</h2>
            <p className="mt-2">
              本条款适用于 Ino Studio（[姓名/公司名称]）与客户之间签订的所有网站、Discord 服务器及定制应用开发服务合同，
              不论客户是否为专业人士。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">2. 项目流程</h2>
            <p className="mt-2">每个项目通常依次经过以下阶段。</p>
            <ul className="mt-3 flex list-disc flex-col gap-1 pl-5">
              <li>通过网站表单提交的初步报价请求</li>
              <li>讨论合同，客户在其中选择所需的服务</li>
              <li>预合同，汇总客户的选择与每项的价格</li>
              <li>最终合同，在客户签署后项目正式启动</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">3. 价格与付款</h2>
            <p className="mt-2">
              每个项目的价格、付款方式与付款时间在该项目的最终合同中具体约定。本页面不构成任何具体价格承诺。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">4. 交付期限</h2>
            <p className="mt-2">
              交付期限在每个项目的预合同与最终合同中约定，并取决于客户按时提供所需内容（图片、文字、相关资料等）。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">5. 撤回权</h2>
            <p className="mt-2">
              作为消费者的客户在签署合同后的 14 天内享有撤回权，除非客户已明确要求并同意工作在此期限内开始，从而放弃该项权利。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">6. 终止</h2>
            <p className="mt-2">
              客户可随时以书面形式终止项目。若工作尚未开始，已支付的款项将全额退还。若工作已经开始，已完成部分对应的款项仍需支付。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">7. 责任</h2>
            <p className="mt-2">
              Ino Studio 承担的是手段义务，而非结果义务。对于第三方服务（托管商、支付平台等）造成的故障，Ino Studio
              不承担责任。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">8. 适用法律与争议解决</h2>
            <p className="mt-2">
              本条款受卢森堡大公国法律管辖。如发生争议，双方应首先尝试友好协商解决，协商不成的，提交卢森堡有管辖权的法院处理。
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-16 pb-20 text-left">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Conditions générales de vente
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Dernière mise à jour le [date]</p>

      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">1. Champ d&apos;application</h2>
          <p className="mt-2">
            Les présentes conditions s&apos;appliquent à tout contrat de création de site web, de serveur Discord
            ou d&apos;application sur mesure conclu entre Ino Studio ([Nom et prénom / raison sociale]) et un
            client, qu&apos;il s&apos;agisse d&apos;un professionnel ou d&apos;un particulier.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">2. Déroulement d&apos;un projet</h2>
          <p className="mt-2">Chaque projet suit généralement les étapes suivantes, dans cet ordre.</p>
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5">
            <li>Une demande de devis initiale transmise via le formulaire du site</li>
            <li>Un contrat de discussion, dans lequel le client choisit les prestations souhaitées</li>
            <li>Un pré contrat récapitulant les choix du client et le prix de chaque option</li>
            <li>Un contrat final, dont la signature par le client lance le projet</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">3. Prix et paiement</h2>
          <p className="mt-2">
            Le prix, les modalités et le calendrier de paiement de chaque projet sont précisés dans le contrat
            final propre à ce projet. La présente page ne constitue aucun engagement de prix.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">4. Délais</h2>
          <p className="mt-2">
            Les délais de livraison sont précisés dans le pré contrat et le contrat final de chaque projet, et
            dépendent de la transmission par le client, dans les temps, des contenus nécessaires (visuels,
            textes, références).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">5. Droit de rétractation</h2>
          <p className="mt-2">
            Le client agissant en tant que consommateur dispose d&apos;un délai de rétractation de 14 jours après
            la signature du contrat, sauf s&apos;il demande expressément et accepte que le travail commence
            pendant ce délai, ce qui vaut renonciation à ce droit.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">6. Résiliation</h2>
          <p className="mt-2">
            Le client peut mettre fin au projet à tout moment par écrit. Si le travail n&apos;a pas encore
            commencé, les sommes versées sont intégralement remboursées. Si le travail a commencé, la part du
            prix correspondant au travail déjà réalisé reste due.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">7. Responsabilité</h2>
          <p className="mt-2">
            Ino Studio est tenu à une obligation de moyens, non de résultat. Ino Studio n&apos;est pas responsable
            des pannes imputables à des services tiers (hébergeur, plateformes de paiement, etc.).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">8. Droit applicable et litiges</h2>
          <p className="mt-2">
            Les présentes conditions sont soumises au droit luxembourgeois. En cas de litige, les parties
            s&apos;efforcent de trouver une solution amiable avant de saisir les tribunaux compétents du
            Luxembourg.
          </p>
        </section>
      </div>
    </div>
  );
}
