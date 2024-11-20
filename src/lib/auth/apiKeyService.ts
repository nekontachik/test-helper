import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { ActivityService } from './activityService';
import { ActivityEventType } from '@/types/activity';
import type { Prisma } from '@prisma/client';

interface ApiKeyMetadata {
  name: string;
  expiresAt?: Date;
  scopes: string[];
}

export class ApiKeyService {
  static async createApiKey(
    userId: string,
    metadata: ApiKeyMetadata
  ): Promise<string> {
    const key = this.generateApiKey();
    const hashedKey = await this.hashApiKey(key);

    await prisma.apiKey.create({
      data: {
        userId,
        hashedKey,
        name: metadata.name,
        expiresAt: metadata.expiresAt,
        scopesData: JSON.stringify(metadata.scopes),
      },
    });

    await ActivityService.log(userId, ActivityEventType.API_KEY_CREATED, {
      metadata: { 
        name: metadata.name,
        action: 'created',
      },
    });

    return key;
  }

  static async validateApiKey(
    key: string,
    requiredScopes: string[] = []
  ): Promise<boolean> {
    const hashedKey = await this.hashApiKey(key);
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        hashedKey,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (!apiKey) return false;

    // Parse scopes from JSON string
    const scopes = JSON.parse(apiKey.scopesData || '[]') as string[];

    // Check if key has all required scopes
    return requiredScopes.every(scope => scopes.includes(scope));
  }

  static async revokeApiKey(userId: string, keyId: string): Promise<void> {
    await prisma.apiKey.deleteMany({
      where: {
        id: keyId,
        userId,
      },
    });

    await ActivityService.log(userId, ActivityEventType.API_KEY_REVOKED, {
      metadata: { 
        keyId,
        action: 'revoked',
      },
    });
  }

  private static generateApiKey(): string {
    return `sk_${randomBytes(32).toString('hex')}`;
  }

  private static async hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
} 