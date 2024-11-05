import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function generateEmailToken(email: string): Promise<string> {
  return await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyEmailToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
} 