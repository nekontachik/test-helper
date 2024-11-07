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
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
    });

    return token;
  }

  static async generatePasswordResetToken(email: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.$executeRaw`
      UPDATE User 
      SET passwordResetToken = ${token}, 
          passwordResetExpires = ${expires.toISOString()}
      WHERE email = ${email}
    `;

    return token;
  }

  static async validateEmailVerificationToken(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) return null;

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

  static async validatePasswordResetToken(token: string) {
    const user = await prisma.$queryRaw<{ id: string; email: string }[]>`
      SELECT id, email 
      FROM User 
      WHERE passwordResetToken = ${token}
      AND passwordResetExpires > ${new Date().toISOString()}
      LIMIT 1
    `;

    return user[0] || null;
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
