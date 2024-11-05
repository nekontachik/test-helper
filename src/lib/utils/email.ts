import { createTransport } from 'nodemailer';
import { renderToStaticMarkup } from 'react-dom/server';
import { VerificationEmail } from '@/emails/VerificationEmail';

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
  
  const emailHtml = renderToStaticMarkup(
    VerificationEmail({
      name: name || email,
      verificationUrl,
    })
  );

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email address',
      html: emailHtml,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

// Add type safety for email templates
export interface EmailTemplateProps {
  name: string;
  verificationUrl: string;
}

// Add error handling and retries
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  retries = 3
): Promise<void> {
  let lastError: Error | undefined;

  for (let i = 0; i < retries; i++) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      });
      return;
    } catch (error) {
      lastError = error as Error;
      console.error(`Email sending attempt ${i + 1} failed:`, error);
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  throw lastError || new Error('Failed to send email after retries');
} 