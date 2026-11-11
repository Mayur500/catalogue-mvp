import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../config.js';

let transporter: Transporter | null = null;

const createTransporter = () => {
  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    transporter ??= nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    return transporter;
  }

  return null;
};

export const sendEnquiryEmail = async (payload: {
  productTitle: string;
  productId: number;
  name: string;
  email: string;
  phone: string;
  message: string;
}) => {
  const transport = createTransporter();

  if (!transport) {
    console.info('SMTP is not configured. Simulating enquiry email delivery locally.', payload);
    return {
      accepted: ['simulated-sales@catalogue.local'],
      previewUrl: 'https://ethereal.email/message-preview',
      simulated: true,
    };
  }

  const result = await transport.sendMail({
    from: config.smtpFrom,
    to: 'sales@catalogue.local',
    subject: `New product enquiry: ${payload.productTitle}`,
    html: `
      <h2>New enquiry received</h2>
      <p><strong>Product:</strong> ${payload.productTitle} (#${payload.productId})</p>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Message:</strong> ${payload.message}</p>
    `,
  });

  return result;
};
