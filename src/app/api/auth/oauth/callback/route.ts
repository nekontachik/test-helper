import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Log OAuth login attempt
    await prisma.userActivity.create({
      data: {
        userId: session?.user?.id,
        type: 'OAUTH_LOGIN',
        details: {
          provider,
          success: true,
        },
      },
    });

    return NextResponse.redirect('/');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect('/auth/error?error=OAuthCallback');
  }
}
