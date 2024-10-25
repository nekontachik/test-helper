import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export class TokenService {
  static async generateEmailVerificationToken(email: string): Promise<string> {
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

  static async generatePasswordResetToken(email: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expires,
      },
    });

    return token;
  }

  static async validateEmailVerificationToken(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) return null;

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

  static async validatePasswordResetToken(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    return user;
  }

  static generateJWT(payload: any, expiresIn: string = '1d'): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
  }

  static verifyJWT<T>(token: string): T | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as T;
    } catch {
      return null;
    }
  }
}
