import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';

interface TrustedDevice {
  id: string;
  name: string;
  userAgent: string;
  lastUsed: Date;
}

export class TrustedDevicesService {
  private static readonly TRUST_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

  static async addTrustedDevice(
    userId: string,
    userAgent: string
  ): Promise<string> {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const deviceName = `${result.browser.name} on ${result.os.name}`;
    const deviceId = crypto.randomBytes(32).toString('hex');

    await prisma.trustedDevice.create({
      data: {
        id: deviceId,
        userId,
        name: deviceName,
        userAgent,
        lastUsed: new Date(),
        expiresAt: new Date(Date.now() + this.TRUST_DURATION),
      },
    });

    return deviceId;
  }

  static async isTrustedDevice(
    userId: string,
    deviceId: string
  ): Promise<boolean> {
    const device = await prisma.trustedDevice.findFirst({
      where: {
        id: deviceId,
        userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (device) {
      await prisma.trustedDevice.update({
        where: { id: deviceId },
        data: { lastUsed: new Date() },
      });
      return true;
    }

    return false;
  }

  static async getTrustedDevices(userId: string): Promise<TrustedDevice[]> {
    return prisma.trustedDevice.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastUsed: 'desc' },
    });
  }

  static async removeTrustedDevice(userId: string, deviceId: string) {
    await prisma.trustedDevice.deleteMany({
      where: {
        id: deviceId,
        userId,
      },
    });
  }

  static async cleanupExpiredDevices() {
    await prisma.trustedDevice.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
} 