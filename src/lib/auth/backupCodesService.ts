import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class BackupCodesService {
  private static readonly CODE_LENGTH = 8;
  private static readonly CODE_COUNT = 10;
  private static readonly CODE_PATTERN = /^[A-Z0-9]{8}$/;

  static generateCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  static async generateCodes(userId: string): Promise<string[]> {
    const codes = Array.from(
      { length: this.CODE_COUNT },
      () => this.generateCode()
    );

    const hashedCodes = await Promise.all(
      codes.map(code => bcrypt.hash(code, 12))
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: hashedCodes,
        backupCodesGeneratedAt: new Date(),
      },
    });

    return codes;
  }

  static async verifyCode(userId: string, code: string): Promise<boolean> {
    if (!this.CODE_PATTERN.test(code)) {
      return false;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { backupCodes: true },
    });

    if (!user?.backupCodes?.length) {
      return false;
    }

    const backupCodes = user.backupCodes;

    for (let i = 0; i < backupCodes.length; i++) {
      const isValid = await bcrypt.compare(code, backupCodes[i]);
      if (isValid) {
        // Remove used code
        const updatedCodes = backupCodes.filter((_, index) => index !== i);
        await prisma.user.update({
          where: { id: userId },
          data: { backupCodes: updatedCodes },
        });
        return true;
      }
    }

    return false;
  }

  static async getCodesCount(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { backupCodes: true },
    });

    return user?.backupCodes?.length || 0;
  }
} 