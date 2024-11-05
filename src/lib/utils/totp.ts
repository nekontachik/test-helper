import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export interface TOTPConfig {
  secret: string;
  uri: string;
  qrCode: string;
}

export async function generateTOTPConfig(email: string): Promise<TOTPConfig> {
  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri(
    email,
    'Your App Name',
    secret
  );
  
  const qrCode = await QRCode.toDataURL(uri);

  return {
    secret,
    uri,
    qrCode,
  };
}

export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

export function generateTOTP(secret: string): string {
  return authenticator.generate(secret);
} 