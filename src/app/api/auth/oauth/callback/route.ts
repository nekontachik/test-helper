import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import type { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = new URL(request.url).searchParams;
    const provider = searchParams.get('provider');
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `/auth/error?error=${error}&provider=${provider}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `/auth/error?error=NoAuthorizationCode&provider=${provider}`
      );
    }

    if (session?.user?.id) {
      // Log OAuth login attempt
      const activityData: Prisma.UserActivityCreateInput = {
        user: {
          connect: {
            id: session.user.id
          }
        },
        type: 'OAUTH_LOGIN',
        details: JSON.stringify({
          provider,
          success: true,
        }),
      };

      await prisma.userActivity.create({
        data: activityData
      });

      logger.info('OAuth login successful', {
        userId: session.user.id,
        provider,
      });
    }

    return NextResponse.redirect('/');
  } catch (error) {
    logger.error('OAuth callback error:', error);
    return NextResponse.redirect('/auth/error?error=OAuthCallback');
  }
}
