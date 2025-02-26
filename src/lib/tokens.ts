import { prisma } from './prisma';
import crypto from 'crypto';
import type { User } from '@prisma/client';

export async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.update({
    where: { email },
    data: {
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    },
  });

  return token;
}

export async function validateVerificationToken(token: string): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: {
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
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  return user;
}
