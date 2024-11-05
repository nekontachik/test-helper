import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { nanoid } from 'nanoid';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_TOKEN_EXPIRY = 60 * 60; // 1 hour

export async function csrfMiddleware(request: Request) {
  try {
    // Skip CSRF check for GET requests and non-mutation operations
    if (request.method === 'GET') {
      return NextResponse.next();
    }

    const session = await getToken({ req: request as any });
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const csrfToken = request.headers.get(CSRF_TOKEN_HEADER);
    if (!csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      );
    }

    const storedToken = await redis.get(`csrf:${session.email}:${csrfToken}`);
    if (!storedToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Token is valid, delete it to prevent reuse
    await redis.del(`csrf:${session.email}:${csrfToken}`);

    return NextResponse.next();
  } catch (error) {
    console.error('CSRF middleware error:', error);
    return NextResponse.json(
      { error: 'CSRF validation failed' },
      { status: 403 }
    );
  }
}

export async function generateCsrfToken(email: string): Promise<string> {
  const token = nanoid();
  await redis.set(
    `csrf:${email}:${token}`,
    true,
    { ex: CSRF_TOKEN_EXPIRY }
  );
  return token;
} 