import { Resend } from "resend";

export interface SendContactEmailParams {
  name: string;
  email: string;
  message: string;
  toAddress: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(
  params: SendContactEmailParams
): Promise<SendEmailResult> {
  try {
    await resend.emails.send({
      from: "Portfolio Contact <noreply@resend.dev>",
      to: params.toAddress,
      replyTo: params.email,
      subject: `New contact message from ${params.name}`,
      text: [
        `Name: ${params.name}`,
        `Email: ${params.email}`,
        ``,
        `Message:`,
        params.message,
      ].join("\n"),
    });

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    return { success: false, error: message };
  }
}
