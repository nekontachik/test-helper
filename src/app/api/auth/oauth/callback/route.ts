import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

export async function GET(_req: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = new URL(_req.url).searchParams;
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
      await prisma.userActivity.create({
        data: {
          user: {
            connect: {
              id: session.user.id
            }
          },
          type: 'OAUTH_LOGIN',
          details: JSON.stringify({
            provider,
            success: true
          })
        }
      });

      logger.info('OAuth login successful', {
        userId: session.user.id,
        provider
      });
    }

    return NextResponse.redirect('/');
  } catch (error) {
    logger.error('OAuth callback error:', error);
    return NextResponse.redirect('/auth/error?error=OAuthCallback');
  }
}
