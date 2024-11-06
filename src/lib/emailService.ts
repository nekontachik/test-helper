import { Resend } from 'resend';
import { generateEmailToken } from './auth/tokens';

// Validate environment variables at startup
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const EMAIL_FROM = process.env.EMAIL_FROM;

// Type guard for environment variables
function assertEnvVar(value: string | undefined, name: string): asserts value is string {
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
}

// Validate required environment variables
assertEnvVar(RESEND_API_KEY, 'RESEND_API_KEY');
assertEnvVar(APP_URL, 'NEXT_PUBLIC_APP_URL');
assertEnvVar(EMAIL_FROM, 'EMAIL_FROM');

const resend = new Resend(RESEND_API_KEY);

export async function sendVerificationEmail(email: string, name: string) {
  try {
    const token = await generateEmailToken(email);
    const verificationUrl = `${APP_URL}/auth/verify?token=${token}`;

    await resend.emails.send({
      from: EMAIL_FROM as string,
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Hello ${name},</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  try {
    const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

    await resend.emails.send({
      from: EMAIL_FROM as string,
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Hello ${name},</h1>
        <p>We received a request to reset your password. Click the link below to choose a new password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}
