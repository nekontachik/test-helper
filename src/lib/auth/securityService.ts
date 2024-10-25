import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export class SecurityService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateTOTPSecret(): string {
    return authenticator.generateSecret();
  }

  static verifyTOTP(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }

  static generateBackupCodes(count: number = 10): string[] {
    return Array.from({ length: count }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );
  }

  static async storeBackupCodes(userId: string, codes: string[]): Promise<void> {
    const hashedCodes = await Promise.all(
      codes.map(code => bcrypt.hash(code, 12))
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: hashedCodes,
      },
    });
  }

  static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { backupCodes: true },
    });

    if (!user?.backupCodes?.length) return false;

    const backupCodes = JSON.parse(user.backupCodes);
    
    for (const hashedCode of backupCodes) {
      if (await bcrypt.compare(code, hashedCode)) {
        // Remove used backup code
        const updatedCodes = backupCodes.filter(c => c !== hashedCode);
        await prisma.user.update({
          where: { id: userId },
          data: { backupCodes: updatedCodes },
        });
        return true;
      }
    }

    return false;
  }

  static async setup2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const secret = this.generateTOTPSecret();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) throw new Error('User not found');

    const qrCode = authenticator.keyuri(
      user.email,
      'Test Management System',
      secret
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: false,
      },
    });

    return { secret, qrCode };
  }

  static async enable2FA(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) return false;

    const isValid = this.verifyTOTP(token, user.twoFactorSecret);

    if (isValid) {
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      });
    }

    return isValid;
  }
}
