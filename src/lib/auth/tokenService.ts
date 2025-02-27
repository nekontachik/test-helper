import jwt from 'jsonwebtoken';
import type { TokenType } from '@/types/token';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import { prisma } from '@/lib/prisma';

interface TokenPayload {
  userId: string;
  email: string;
  type: TokenType;
  expiresIn?: string;
}

export class TokenService {
  private static readonly SECRET = process.env.JWT_SECRET || 'default-secret-key';

  static generateToken(payload: TokenPayload): string {
    const { expiresIn, ...tokenData } = payload;
    return jwt.sign(
      tokenData, 
      Buffer.from(this.SECRET, 'utf-8'), 
      { expiresIn: expiresIn || '1h' }
    );
  }

  static verify(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, Buffer.from(this.SECRET, 'utf-8')) as TokenPayload;
    } catch {
      return null;
    }
  }

  static async generateEmailVerificationToken(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const token = randomBytes(32).toString('hex');
    const expires = addHours(new Date(), 24); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expires
      }
    });

    return token;
  }

  static async validateEmailVerificationToken(token: string): Promise<{ id: string; email: string } | null> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true
      }
    });

    return user;
  }

  static async generatePasswordResetToken(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const token = randomBytes(32).toString('hex');
    const expires = addHours(new Date(), 1); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expires
      }
    });

    return token;
  }

  static async validatePasswordResetToken(token: string): Promise<{ id: string; email: string } | null> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true
      }
    });

    return user;
  }
}
