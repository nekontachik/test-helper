import { NextResponse } from 'next/server';
import type { SecureRouteContext } from '@/lib/api/createSecureRoute';
import { createSecureRoute } from '@/lib/api/createSecureRoute';
import { Action, Resource } from '@/types/rbac';
import { prisma } from '@/lib/prisma';
import { SecurityService } from '@/lib/auth/securityService';
import { ActivityService } from '@/lib/auth/activityService';
import { sendEmailChangeVerification } from '@/lib/utils/email';
import { generateToken } from '@/lib/utils/token';
import { ActivityEventType } from '@/types/activity';
import { z } from 'zod';
import logger from '@/lib/logger';

// Define request schema using Zod
const EmailChangeSchema = z.object({
  newEmail: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

type EmailChangeRequest = z.infer<typeof EmailChangeSchema>;

async function handler(request: Request, context: SecureRouteContext): Promise<NextResponse> {
  if (!context.session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = EmailChangeSchema.parse(body) as EmailChangeRequest;

    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: context.session.user.id },
      select: { id: true, email: true, password: true }
    });

    if (!user || !await SecurityService.verifyPassword(data.password, user.password)) {
      await ActivityService.log(context.session.user.id, ActivityEventType.EMAIL_CHANGE_FAILED, {
        ip,
        userAgent,
        metadata: { reason: 'invalid_password' }
      });

      return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: data.newEmail }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const token = await generateToken();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: context.session.user.id },
      data: {
        emailChangeToken: token,
        emailChangeTokenExpiry: expires,
        pendingEmail: data.newEmail
      }
    });

    await sendEmailChangeVerification(data.newEmail, token);
    await ActivityService.log(context.session.user.id, ActivityEventType.EMAIL_CHANGE_REQUESTED, {
      ip,
      userAgent,
      metadata: { newEmail: data.newEmail }
    });

    logger.info('Email change requested', { 
      userId: context.session.user.id, 
      newEmail: data.newEmail
    });

    return NextResponse.json({
      message: 'Verification email sent to new address'
    });
  } catch (error) {
    logger.error('Email change request error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export const POST = createSecureRoute(handler, {
  requireAuth: true,
  requireVerified: true,
  action: Action.UPDATE,
  resource: Resource.ACCOUNT,
  rateLimit: {
    points: 5,
    duration: 60 * 60 // 1 hour
  },
  audit: {
    action: 'EMAIL_CHANGE_REQUEST',
    getMetadata: async (req) => ({
      ip: req.headers.get('x-forwarded-for'),
      userAgent: req.headers.get('user-agent')
    })
  }
}); 