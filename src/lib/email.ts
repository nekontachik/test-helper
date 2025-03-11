import { createTransport } from 'nodemailer';
import jwt from 'jsonwebtoken';

const transporter = createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, name: string): Promise<void> {
  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your email address',
    html: `
      <div>
        <h1>Welcome to Testing Buddy</h1>
        <p>Hello ${name},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #3182ce;
          color: white;
          text-decoration: none;
          border-radius: 6px;
        ">
          Verify Email
        </a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
}
