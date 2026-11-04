import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '@/config/env';
import type { EmailContent } from './templates';

let transporter: Transporter | null = null;

function smtp(): Transporter | null {
  const e = env();
  if (!e.SMTP_HOST) return null;
  if (!transporter) {
    const port = e.SMTP_PORT ?? 465;
    transporter = nodemailer.createTransport({
      host: e.SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465 && port !== 1025, // 1025 = local Mailpit
      auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

/**
 * Sends an email. Without SMTP (local development) the message is written to MAIL_DIR as an .eml
 * file you can open in any mail client, so the whole flow is testable offline.
 */
export async function sendEmail(to: string, content: EmailContent, opts: { replyTo?: string } = {}) {
  const e = env();
  const from = e.MAIL_FROM ?? 'VasuPrint <no-reply@localhost>';
  const message = { from, to, replyTo: opts.replyTo, subject: content.subject, html: content.html, text: content.text };
  const t = smtp();
  if (t) {
    await t.sendMail(message);
    return { delivered: 'smtp' as const };
  }
  const preview = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
  const info = await preview.sendMail(message);
  const dir = path.resolve(e.MAIL_DIR);
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${new Date().toISOString().replace(/[:.]/g, '-')}-${content.subject.replace(/[^\w-]+/g, '_').slice(0, 60)}.eml`);
  await writeFile(file, info.message as Buffer);
  return { delivered: 'file' as const, file };
}
