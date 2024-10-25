import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/types/auth';
import { generateVerificationToken, generatePasswordResetToken } from './tokens';
import { sendVerificationEmail, sendPasswordResetEmail } from '../emailService';

export class AuthService {
  static async createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        hashedPassword,
        role: data.role || 'USER',
      },
    });

    await sendVerificationEmail(user.email, user.name || 'User');

    return user;
  }

  static async verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async initiatePasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) return null;

    const token = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(email, user.name || 'User', token);

    return true;
  }

  static async verifyEmail(token: string) {
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

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hashedPassword: true },
    });

    if (!user?.hashedPassword) return false;

    const isValid = await this.verifyPassword(currentPassword, user.hashedPassword);
    if (!isValid) return false;

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword },
    });

    return true;
  }

  static async validateSession(sessionId: string, userId: string) {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        expires: {
          gt: new Date(),
        },
      },
    });

    return !!session;
  }

  static async setBackupCodes(userId: string, codes: string[]) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: JSON.stringify(codes),
      },
    });
  }

  static async getBackupCodes(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { backupCodes: true },
    });

    return user?.backupCodes ? JSON.parse(user.backupCodes) : [];
  }
}
