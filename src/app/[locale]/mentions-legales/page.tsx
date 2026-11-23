import { setRequestLocale } from "next-intl/server";

export default async function MentionsLegales({ params }: PageProps<"/[locale]/mentions-legales">) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale === "zh") {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-20 text-left">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">法律声明</h1>
        <p className="mt-2 text-sm text-ink-soft">最后更新 2026年11月23日</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-ink-soft">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">1. 网站发布者</h2>
            <p className="mt-2">
              本网站由 INO 发布，该公司注册地址位于卢森堡市，卢森堡。
            </p>
            <p className="mt-2">联系邮箱为 ilyinhoff@gmail.com</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">2. 网站托管</h2>
            <p className="mt-2">
              本网站由 Vercel Inc.（340 S Lemon Ave #4133, Walnut, CA 91789, 美国）托管。数据库、身份验证与文件存储由
              Supabase Inc. 提供。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">3. 知识产权</h2>
            <p className="mt-2">
              本网站的结构、设计、文本、标志与视觉元素均受知识产权法保护，归 Ino Studio
              所有，未经事先书面许可不得复制或使用。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">4. 责任</h2>
            <p className="mt-2">
              Ino Studio 尽力确保网站信息的准确性，但不对信息的完整性或时效性作出保证。使用本网站产生的风险由用户自行承担。
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">5. 适用法律</h2>
            <p className="mt-2">本法律声明受卢森堡大公国法律管辖。</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-16 pb-20 text-left">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Mentions légales</h1>
      <p className="mt-2 text-sm text-ink-soft">Dernière mise à jour le 23 novembre 2026</p>

      <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">1. Éditeur du site</h2>
          <p className="mt-2">
            Le présent site est édité par INO, société domiciliée à Luxembourg, Luxembourg.
          </p>
          <p className="mt-2">L&apos;adresse de contact est ilyinhoff@gmail.com</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">2. Hébergement</h2>
          <p className="mt-2">
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États Unis. La base de
            données, l&apos;authentification et le stockage des fichiers sont assurés par Supabase Inc.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">3. Propriété intellectuelle</h2>
          <p className="mt-2">
            La structure, le design, les textes, le logo et les éléments visuels de ce site sont protégés par le
            droit de la propriété intellectuelle et appartiennent à Ino Studio. Toute reproduction ou utilisation
            sans autorisation écrite préalable est interdite.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">4. Responsabilité</h2>
          <p className="mt-2">
            Ino Studio s&apos;efforce d&apos;assurer l&apos;exactitude des informations publiées sur ce site, sans
            garantir qu&apos;elles soient complètes ou à jour. L&apos;utilisation du site se fait sous la seule
            responsabilité de l&apos;utilisateur.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">5. Droit applicable</h2>
          <p className="mt-2">Les présentes mentions légales sont soumises au droit luxembourgeois.</p>
        </section>
      </div>
    </div>
  );
}
