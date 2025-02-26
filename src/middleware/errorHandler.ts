import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { formatErrorResponse, logError, normalizeError } from '@/lib/utils/errorUtils';

export async function errorHandler(
  request: NextRequest,
  handler: () => Promise<Response>
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    const normalizedError = normalizeError(error);
    logError(error, {
      url: request.url,
      method: request.method
    });

    return NextResponse.json(
      formatErrorResponse(error),
      { status: normalizedError.status || 500 }
    );
  }
}
