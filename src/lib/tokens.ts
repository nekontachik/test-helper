import { prisma } from './prisma';
import crypto from 'crypto';

export async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.update({
    where: { email },
    data: {
      verifyToken: token,
      verifyTokenExpiry: expires,
    },
  });

  return token;
}

export async function validateVerificationToken(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      verifyToken: token,
      verifyTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verifyToken: null,
      verifyTokenExpiry: null,
    },
  });

  return user;
}
