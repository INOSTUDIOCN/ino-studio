import { setRequestLocale } from "next-intl/server";

export default async function Confidentialite({ params }: PageProps<"/[locale]/confidentialite">) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale === "zh") {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-20 text-left">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">隐私政策</h1>
        <p className="mt-2 text-sm text-ink-soft">最后更新 [日期]</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-ink-soft">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">1. 数据处理负责人</h2>
            <p className="mt-2">
              Ino Studio（[姓名/公司名称]，[地址]）是本网站收集的个人数据的处理负责人。如有任何问题，请联系
              [联系邮箱]。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">2. 我们收集哪些数据</h2>
            <p className="mt-2">根据您使用网站的方式，我们可能收集以下信息。</p>
            <ul className="mt-3 flex list-disc flex-col gap-1 pl-5">
              <li>报价表单中填写的姓名、邮箱与项目描述</li>
              <li>创建客户账户时使用的姓名与邮箱</li>
              <li>签署合同时的电子签名图像、提交时间与 IP 地址，用于证明签署的真实性</li>
              <li>您上传或由我们提供给您的项目文件</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">3. 处理目的与法律依据</h2>
            <p className="mt-2">
              这些数据用于回复您的报价请求、管理您的客户空间、跟进项目进度，以及在适用情况下履行我们之间的合同。
              处理依据为合同的履行以及我们回复请求的正当利益。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">4. 数据接收方</h2>
            <p className="mt-2">
              您的数据由以下服务商处理，它们作为数据处理者存储或处理这些信息，包括 Supabase Inc.（数据库、身份验证、文件存储）、
              Vercel Inc.（网站托管）以及 Resend（邮件发送，启用后）。这些服务商均承诺按照适用的数据保护法规处理数据。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">5. 保存期限</h2>
            <p className="mt-2">
              数据的保存时间不超过实现上述目的所必需的时间，且根据适用法律要求的会计或法律保存期限保留。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">6. 您的权利</h2>
            <p className="mt-2">
              根据《通用数据保护条例》，您有权访问、更正、删除您的数据，有权限制或反对处理，也有权获得数据可携带性。
              如需行使这些权利，请发送邮件至 [联系邮箱]。您也有权向卢森堡国家数据保护委员会（CNPD）提出投诉。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">7. Cookie</h2>
            <p className="mt-2">
              本网站使用一个记录语言偏好的 cookie（INO_LOCALE），以及由 Supabase
              设置的登录会话所必需的技术性 cookie。这些 cookie 不用于广告追踪。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">8. 数据安全</h2>
            <p className="mt-2">
              我们采取合理的技术措施保护您的数据，包括基于角色的数据库访问控制与加密传输。
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-16 pb-20 text-left">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-ink-soft">Dernière mise à jour le [date]</p>

      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">1. Responsable du traitement</h2>
          <p className="mt-2">
            Ino Studio, exploité par [Nom et prénom / raison sociale], domicilié(e) au [adresse], est responsable
            du traitement des données personnelles collectées sur ce site. Pour toute question, vous pouvez
            écrire à [email de contact].
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">2. Données collectées</h2>
          <p className="mt-2">Selon votre usage du site, nous pouvons collecter les informations suivantes.</p>
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5">
            <li>Le nom, l&apos;email et la description du projet transmis via le formulaire de devis</li>
            <li>Le nom et l&apos;email utilisés pour la création d&apos;un compte client</li>
            <li>
              L&apos;image de la signature électronique, l&apos;horodatage et l&apos;adresse IP lors de la
              signature d&apos;un contrat, afin de prouver l&apos;authenticité de la signature
            </li>
            <li>Les fichiers de projet que vous transmettez ou que nous mettons à votre disposition</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">3. Finalités et base légale</h2>
          <p className="mt-2">
            Ces données servent à répondre à vos demandes de devis, gérer votre espace client, assurer le suivi
            de votre projet et, le cas échéant, exécuter le contrat qui nous lie. Le traitement repose sur
            l&apos;exécution du contrat et sur l&apos;intérêt légitime de répondre à vos demandes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">4. Destinataires des données</h2>
          <p className="mt-2">
            Vos données sont traitées par les prestataires suivants, agissant comme sous traitants, notamment Supabase
            Inc. (base de données, authentification, stockage des fichiers), Vercel Inc. (hébergement du site) et
            Resend (envoi d&apos;emails, une fois activé). Ces prestataires s&apos;engagent à traiter les données
            conformément à la réglementation applicable en matière de protection des données.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">5. Durée de conservation</h2>
          <p className="mt-2">
            Les données sont conservées le temps nécessaire aux finalités décrites ci dessus, et selon les durées
            légales de conservation applicables en matière comptable ou juridique.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">6. Vos droits</h2>
          <p className="mt-2">
            Conformément au Règlement général sur la protection des données, vous disposez d&apos;un droit
            d&apos;accès, de rectification, d&apos;effacement, de limitation et d&apos;opposition au traitement,
            ainsi que d&apos;un droit à la portabilité de vos données. Pour exercer ces droits, vous pouvez écrire
            à [email de contact]. Vous disposez également du droit d&apos;introduire une réclamation auprès de la
            Commission nationale pour la protection des données (CNPD) du Luxembourg.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">7. Cookies</h2>
          <p className="mt-2">
            Ce site utilise un cookie de préférence de langue (INO_LOCALE), ainsi que les cookies techniques
            nécessaires à la session de connexion, déposés par Supabase. Ces cookies ne sont pas utilisés à des
            fins publicitaires.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">8. Sécurité</h2>
          <p className="mt-2">
            Des mesures techniques raisonnables sont mises en place pour protéger vos données, notamment un
            contrôle d&apos;accès à la base de données basé sur les rôles et un chiffrement des échanges.
          </p>
        </section>
      </div>
    </div>
  );
}
