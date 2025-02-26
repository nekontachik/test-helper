import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RequestSigning } from '@/lib/auth/signing';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import { corsMiddleware } from '@/middleware/cors';
import { securityHeaders } from '@/middleware/securityHeaders';

export async function POST(request: NextRequest) {
  // Apply security middlewares
  const corsResponse = await corsMiddleware(request);
  if (corsResponse.status === 204) return corsResponse;

  const apiKeyResponse = await apiKeyMiddleware(request, ['write:data']);
  if (apiKeyResponse instanceof Response) return apiKeyResponse;

  const headersResponse = await securityHeaders(request);
  if (headersResponse instanceof Response) return headersResponse;

  try {
    const body = await request.text();
    const timestamp = Number(request.headers.get('X-Request-Timestamp'));
    const signature = request.headers.get('X-Request-Signature');
    const apiKey = request.headers.get('X-API-Key');

    if (!timestamp || !signature || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required headers' },
        { status: 400 }
      );
    }

    const isValid = RequestSigning.verifyRequest(
      body,
      timestamp,
      signature,
      apiKey
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid request signature' },
        { status: 401 }
      );
    }

    // Process the request...
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Secure endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 