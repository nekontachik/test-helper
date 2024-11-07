import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createSecureRoute } from '@/lib/api/createSecureRoute';
import { Action, Resource } from '@/types/rbac';
import { z } from 'zod';

// Define the response schema using Zod
const VerificationStatusResponse = z.object({
  emailVerified: z.boolean(),
  twoFactorEnabled: z.boolean(),
  lastLogin: z.date().nullable(),
  activeSessions: z.number(),
  lastActive: z.number().nullable()
});

type VerificationStatus = z.infer<typeof VerificationStatusResponse>;

async function handler(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      emailVerified: true,
      twoFactorEnabled: true,
      lastLogin: true,
      sessions: {
        where: {
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          lastActive: true,
          userAgent: true,
        },
      },
    },
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
    lastLogin: user.lastLogin,
    activeSessions: user.sessions.length,
    lastActive: user.sessions.length > 0 
      ? Math.max(...user.sessions.map(s => s.lastActive.getTime()))
      : null,
  };

  // Validate the response against the schema
  const validationResult = VerificationStatusResponse.safeParse(response);
  if (!validationResult.success) {
    console.error('Invalid response format:', validationResult.error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  return NextResponse.json(response);
}

// Wrap the handler with createSecureRoute for security features
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
