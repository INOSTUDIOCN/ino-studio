import "server-only";
import { Resend } from "resend";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.log(`[email] RESEND_API_KEY/RESEND_FROM_EMAIL non configurés, email ignoré (${subject} -> ${to})`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error("[email] Échec de l'envoi", error);
    }
  } catch (err) {
    console.error("[email] Erreur inattendue", err);
  }
}
