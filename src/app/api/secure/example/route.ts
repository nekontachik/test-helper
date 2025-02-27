import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { RequestSigning } from '@/lib/auth/signing';
import { apiKeyMiddleware } from '@/middleware/apiKey';
import { corsMiddleware } from '@/middleware/cors';
import { securityHeaders } from '@/middleware/securityHeaders';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  // Apply security middlewares
  const corsResponse = await corsMiddleware(_req);
  if (corsResponse.status === 204) {
    return createErrorResponse('CORS preflight', 'CORS_PREFLIGHT', 204);
  }

  const apiKeyResponse = await apiKeyMiddleware(_req, ['write:data']);
  if (apiKeyResponse instanceof Response) {
    return createErrorResponse('Invalid API key', 'INVALID_API_KEY', 401);
  }

  const headersResponse = await securityHeaders(_req);
  if (headersResponse instanceof Response) {
    return createErrorResponse('Security headers check failed', 'SECURITY_HEADERS_FAILED', 403);
  }

  try {
    const body = await _req.text();
    const timestamp = Number(_req.headers.get('X-Request-Timestamp'));
    const signature = _req.headers.get('X-Request-Signature');
    const apiKey = _req.headers.get('X-API-Key');

    if (!timestamp || !signature || !apiKey) {
      return createErrorResponse('Missing required headers', 'MISSING_HEADERS', 400);
    }

    const isValid = RequestSigning.verifyRequest(
      body,
      timestamp,
      signature,
      apiKey
    );

    if (!isValid) {
      return createErrorResponse('Invalid request signature', 'INVALID_SIGNATURE', 401);
    }

    // Process the _req...
    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Secure endpoint error:', error);
    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
