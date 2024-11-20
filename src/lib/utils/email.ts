import { createTransport } from 'nodemailer';
import logger from '@/lib/logger';

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Hello ${name},</h1>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    logger.info('Password reset email sent', { email });
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendEmailChangeVerification(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email-change?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify Your New Email Address',
      html: `
        <h1>Email Change Verification</h1>
        <p>Please click the link below to verify your new email address:</p>
        <a href="${verifyUrl}">Verify Email</a>
        <p>If you didn't request this change, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    logger.info('Email change verification sent', { email });
  } catch (error) {
    logger.error('Failed to send email change verification:', error);
    throw new Error('Failed to send email change verification');
  }
} 