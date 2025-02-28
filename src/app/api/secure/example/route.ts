import { type NextRequest, NextResponse } from 'next/server';
import { RequestSigning } from '@/lib/auth/signing';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import { corsMiddleware } from '@/middleware/cors';
import { securityHeaders } from '@/middleware/securityHeaders';

export async function POST(_req: NextRequest): Promise<Response> {
  // Apply CORS middleware
  const corsResult = corsMiddleware(_req);
  
  // Handle preflight requests
  if (corsResult instanceof Response && corsResult.status === 204) {
    return corsResult;
  }
  
  // Apply API key middleware
  const apiKeyResponse = await apiKeyMiddleware(_req, ['write:data']);
  if (apiKeyResponse instanceof Response) {
    return apiKeyResponse;
  }

  // Apply security headers
  const securityHeadersResult = securityHeaders(_req);
  
  try {
    const body = await _req.text();
    const timestamp = Number(_req.headers.get('X-Request-Timestamp'));
    const signature = _req.headers.get('X-Request-Signature');
    const apiKey = _req.headers.get('X-API-Key');

    if (!timestamp || !signature || !apiKey) {
      return NextResponse.json(
        { success: false, message: 'Missing required headers', error: { code: 'MISSING_HEADERS' } },
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
        { success: false, message: 'Invalid request signature', error: { code: 'INVALID_SIGNATURE' } },
        { status: 401 }
      );
    }

    // Process the request...
    const successResponse = { success: true, data: { success: true }, status: 200 };
    
    // Create a NextResponse with the success data
    const response = NextResponse.json(successResponse);
    
    // Apply CORS and security headers to the response
    if (corsResult instanceof Headers) {
      corsResult.forEach((value, key) => {
        response.headers.set(key, value);
      });
    }
    
    securityHeadersResult.forEach((value, key) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error) {
    console.error('Secure endpoint error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
