import nodemailer from 'nodemailer';
import logger from './logger';
import { ErrorFactory } from '@/lib/errors/ErrorFactory';
import type { ErrorCode } from '@/lib/errors/types';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    logger.info('Sending email', { to: options.to, subject: options.subject });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@testmanager.com',
      ...options
    });

    logger.info('Email sent successfully', { to: options.to });
  } catch (error) {
    logger.error('Failed to send email', { error, to: options.to });
    throw ErrorFactory.create('EMAIL_ERROR' as ErrorCode, 'Failed to send email');
  }
} 