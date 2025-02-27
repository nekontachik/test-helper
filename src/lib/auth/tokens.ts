import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const TOKEN_EXPIRY = '1h';

export async function generateEmailToken(email: string): Promise<string> {
  return await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function generatePasswordResetToken(email: string): Promise<string> {
  try {
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRY)
      .sign(secret);

    // Store the token in the database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    return token;
  } catch (error) {
    logger.error('Error generating password reset token:', error);
    throw new Error('Failed to generate reset token');
  }
}

export async function verifyEmailToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function verifyPasswordResetToken(token: string): Promise<{ id: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { 
        email: payload.email as string,
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true,
      },
    });

    return user;
  } catch (error) {
    logger.error('Error verifying password reset token:', error);
    return null;
  }
} 