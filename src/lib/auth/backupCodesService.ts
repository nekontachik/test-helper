import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface BackupCodePair {
  code: string;
  hashedCode: string;
}

interface BackupCodeRecord {
  id: string;
  code: string;
  userId: string;
  createdAt: Date;
  used: boolean;
}

export class BackupCodesService {
  private static readonly CODE_LENGTH = 8;
  private static readonly CODE_COUNT = 10;
  private static readonly CODE_PATTERN = /^[A-Z0-9]{8}$/;

  private static generateCode(): BackupCodePair {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const hashedCode = bcrypt.hashSync(code, 12);
    return { code, hashedCode };
  }

  static async generateCodes(userId: string): Promise<string[]> {
    const backupCodes = Array.from(
      { length: this.CODE_COUNT },
      () => this.generateCode()
    );

    // Delete existing backup codes
    await prisma.$transaction([
      prisma.$executeRaw`DELETE FROM BackupCode WHERE userId = ${userId}`,
      prisma.$executeRaw`UPDATE User SET backupCodesUpdatedAt = ${new Date().toISOString()} WHERE id = ${userId}`
    ]);

    // Create new backup codes
    const createdCodes = await Promise.all(
      backupCodes.map(({ hashedCode }) =>
        prisma.$executeRaw`INSERT INTO BackupCode (id, code, userId, createdAt, used) VALUES (${crypto.randomUUID()}, ${hashedCode}, ${userId}, ${new Date().toISOString()}, false)`
      )
    );

    return backupCodes.map(({ code }) => code);
  }

  static async verifyCode(userId: string, code: string): Promise<boolean> {
    if (!this.CODE_PATTERN.test(code)) {
      return false;
    }

    const backupCodes = await prisma.$queryRaw<BackupCodeRecord[]>`
      SELECT * FROM BackupCode 
      WHERE userId = ${userId} 
      AND used = false
    `;

    for (const backupCode of backupCodes) {
      const isValid = await bcrypt.compare(code, backupCode.code);
      if (isValid) {
        // Mark code as used
        await prisma.$executeRaw`
          UPDATE BackupCode 
          SET used = true 
          WHERE id = ${backupCode.id}
        `;
        return true;
      }
    }

    return false;
  }

  static async getCodesCount(userId: string): Promise<number> {
    const result = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count 
      FROM BackupCode 
      WHERE userId = ${userId} 
      AND used = false
    `;
    return Number(result[0].count);
  }
} 