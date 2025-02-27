import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SecureRouteContext } from '@/lib/api/createSecureRoute';
import { createSecureRoute } from '@/lib/api/createSecureRoute';
import { Action, Resource } from '@/types/rbac';
import { z } from 'zod';
import logger from '@/lib/logger';

// Define response schema using Zod
const VerificationStatusResponse = z.object({
  emailVerified: z.boolean(),
  twoFactorEnabled: z.boolean(),
  activeSessions: z.number(),
  lastActive: z.date().nullable(),
  sessions: z.array(z.object({
    id: z.string(),
    lastActive: z.date(),
    userAgent: z.string().nullable(),
    ipAddress: z.string().nullable() 
  }))
});

type VerificationStatus = z.infer<typeof VerificationStatusResponse>;

async function handler(request: Request, context: SecureRouteContext): Promise<NextResponse> {
  if (!context.session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: context.session.user.id },
      select: {
        emailVerified: true,
        twoFactorEnabled: true,
        sessions: {
          where: {
            expiresAt: { gt: new Date() }
          },
          select: {
            id: true,
            lastActive: true,
            userAgent: true,
            ipAddress: true
          },
          orderBy: {
            lastActive: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const response: VerificationStatus = {
      emailVerified: !!user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      activeSessions: user.sessions.length,
      lastActive: user.sessions[0]?.lastActive || null,
      sessions: user.sessions
    };

    // Validate response against schema
    const validationResult = VerificationStatusResponse.safeParse(response);
    if (!validationResult.success) {
      logger.error('Invalid response format:', validationResult.error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    logger.info('Verification status checked', {
      userId: context.session.user.id,
      emailVerified: response.emailVerified,
      twoFactorEnabled: response.twoFactorEnabled,
      activeSessions: response.activeSessions
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}

export const GET = createSecureRoute(handler, {
  requireAuth: true,
  requireVerified: false,
  action: Action.READ,
  resource: Resource.ACCOUNT,
  rateLimit: {
    points: 10,
    duration: 60
  },
  audit: {
    action: 'VERIFICATION_STATUS_CHECK',
    getMetadata: async (req) => ({
      ip: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent')
    })
  }
});
