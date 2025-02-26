import { compare, hash } from 'bcryptjs';
import crypto from 'crypto';
import { promisify } from 'util';
import logger from '@/lib/logger';

const randomBytesAsync = promisify(crypto.randomBytes);

export class SecurityService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly BACKUP_CODE_LENGTH = 8;
  private static readonly NUM_BACKUP_CODES = 10;

  static async hashPassword(password: string): Promise<string> {
    return hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  static async generateBackupCodes(): Promise<string[]> {
    try {
      const codes: string[] = [];
      for (let i = 0; i < this.NUM_BACKUP_CODES; i++) {
        const buffer = await randomBytesAsync(this.BACKUP_CODE_LENGTH / 2);
        codes.push(buffer.toString('hex').toUpperCase());
      }
      return codes;
    } catch (error) {
      logger.error('Failed to generate backup codes:', error);
      throw new Error('Failed to generate backup codes');
    }
  }

  static async hashBackupCodes(codes: string[]): Promise<string[]> {
    try {
      return await Promise.all(
        codes.map(code => this.hashPassword(code))
      );
    } catch (error) {
      logger.error('Failed to hash backup codes:', error);
      throw new Error('Failed to hash backup codes');
    }
  }

  static async checkPasswordBreached(password: string): Promise<boolean> {
    try {
      const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();

      return text.split('\n').some(line => {
        const [hashSuffix] = line.split(':');
        return hashSuffix === suffix;
      });
    } catch (error) {
      logger.error('Failed to check password breach:', error);
      return false; // Fail open - don't block registration if service is down
    }
  }

  static async checkBruteForce(_ip: string, _action: string): Promise<void> {
    // Implementation for brute force protection
  }
}
