import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ApiKeyService } from '@/lib/auth/apiKeyService';

export async function apiKeyMiddleware(
  request: NextRequest,
  requiredScopes: string[] = []
): Promise<NextResponse> {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required' },
      { status: 401 }
    );
  }

  const isValid = await ApiKeyService.validateApiKey(apiKey, requiredScopes);

  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid API key or insufficient permissions' },
      { status: 403 }
    );
  }

  return NextResponse.next();
} 