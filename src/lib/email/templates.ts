function baseLayout(title: string, bodyHtml: string, ctaUrl?: string, ctaLabel?: string) {
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f1f2f4;font-family:Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:24px;padding:32px;">
            <tr>
              <td style="font-size:20px;font-weight:700;color:#121212;padding-bottom:24px;">Ino Studio</td>
            </tr>
            <tr>
              <td style="font-size:18px;font-weight:700;color:#121212;padding-bottom:12px;">${title}</td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:1.6;color:#5b5c63;">${bodyHtml}</td>
            </tr>
            ${
              ctaUrl && ctaLabel
                ? `<tr>
              <td style="padding-top:24px;">
                <a href="${ctaUrl}" style="display:inline-block;background-color:#121212;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:14px;">${ctaLabel}</a>
              </td>
            </tr>`
                : ""
            }
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function clientAccountCreatedEmail(fullName: string) {
  return {
    subject: "Votre espace client Ino Studio est prêt",
    html: baseLayout(
      "Bienvenue",
      `<p>Bonjour ${fullName},</p><p>Votre espace client Ino Studio a été créé. Vous pouvez vous y connecter avec l&apos;email et le mot de passe qui vous ont été communiqués.</p>`,
      `${SITE_URL}/fr/connexion`,
      "Accéder à mon espace client"
    ),
  };
}

export function contractReadyEmail(fullName: string) {
  return {
    subject: "Un contrat vous attend",
    html: baseLayout(
      "Contrat à traiter",
      `<p>Bonjour ${fullName},</p><p>Un nouveau contrat est disponible dans votre espace client. Merci de le consulter et d&apos;y répondre dès que possible.</p>`,
      `${SITE_URL}/fr/espace-client/contrats`,
      "Voir le contrat"
    ),
  };
}

export function stepAwaitingValidationEmail(fullName: string, projectName: string) {
  return {
    subject: "Une étape de votre projet est à valider",
    html: baseLayout(
      "Étape à valider",
      `<p>Bonjour ${fullName},</p><p>Une étape du projet « ${projectName} » attend votre validation dans votre espace client.</p>`,
      `${SITE_URL}/fr/espace-client`,
      "Voir mon projet"
    ),
  };
}
