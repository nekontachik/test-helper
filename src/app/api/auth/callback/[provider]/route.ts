import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/auth/rateLimit';

export async function GET(
  request: Request,
  { params }: { params: { provider: string } }
) {
  try {
    // Check rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`oauth_${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: 'Too many requests' },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);
    const searchParams = new URL(request.url).searchParams;
    const error = searchParams.get('error');
    const code = searchParams.get('code');

    if (error) {
      return NextResponse.redirect(
        `/auth/error?error=${error}&provider=${params.provider}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `/auth/error?error=NoCode&provider=${params.provider}`
      );
    }

    if (!session) {
      return NextResponse.redirect('/auth/signin');
    }

    // Get callback URL from state parameter or default to home
    const state = searchParams.get('state');
    const callbackUrl = state ? decodeURIComponent(state) : '/';

    return NextResponse.redirect(callbackUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect('/auth/error?error=Callback');
  }
}
