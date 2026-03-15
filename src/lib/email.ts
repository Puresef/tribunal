import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email not sent.');
    return { error: 'Missing API key' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'The Tribunal <onboarding@resend.dev>', // You can change this once you have a verified domain
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error('Unexpected email error:', err);
    return { error: err };
  }
}
