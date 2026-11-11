import nodemailer, { type SendMailOptions, type Transporter } from 'nodemailer';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { config } from '../config.js';

let transporter: Transporter | null = null;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] as string);

const getMessage = (payload: {
  productTitle: string;
  productId: number;
  name: string;
  email: string;
  phone: string;
  message: string;
}): SendMailOptions => ({
  from: config.smtpFrom,
  to: config.salesInbox || 'sales@catalogue.local',
  subject: `New product enquiry: ${payload.productTitle}`,
  text: [
    `Product: ${payload.productTitle} (#${payload.productId})`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Message: ${payload.message}`,
  ].join('\n'),
  html: `
    <h2>New enquiry received</h2>
    <p><strong>Product:</strong> ${escapeHtml(payload.productTitle)} (#${payload.productId})</p>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>
    <p><strong>Message:</strong> ${escapeHtml(payload.message)}</p>
  `,
});

const createSmtpTransporter = () => {
  if (!config.smtpHost || !config.salesInbox) return null;

  transporter ??= nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    ...(config.smtpUser && config.smtpPass
      ? { auth: { user: config.smtpUser, pass: config.smtpPass } }
      : {}),
  });

  return transporter;
};

export const sendEnquiryEmail = async (payload: {
  productTitle: string;
  productId: number;
  name: string;
  email: string;
  phone: string;
  message: string;
}) => {
  const message = getMessage(payload);
  const smtpTransporter = createSmtpTransporter();

  if (smtpTransporter) {
    return smtpTransporter.sendMail(message);
  }

  // Keep local development account-free while preserving a reviewable email artifact.
  const localOutbox = fileURLToPath(new URL('../../.outbox/', import.meta.url));
  const localTransporter = nodemailer.createTransport({ streamTransport: true, buffer: true });
  const result = await localTransporter.sendMail(message);
  await mkdir(localOutbox, { recursive: true });
  await writeFile(join(localOutbox, `${randomUUID()}.eml`), result.message);

  return { accepted: ['local-outbox'], simulated: true };
};
