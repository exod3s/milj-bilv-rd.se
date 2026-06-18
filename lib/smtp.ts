import nodemailer, { type Transporter } from "nodemailer";

let smtpTransport: Transporter | null = null;

export function hasSmtpProvider() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
  );
}

export function getSmtpTransport() {
  if (!hasSmtpProvider()) {
    throw new Error("SMTP-inställningar saknas");
  }

  if (!smtpTransport) {
    const port = Number(process.env.SMTP_PORT);

    smtpTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000
    });
  }

  return smtpTransport;
}
