import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { RefreshTokenService } from '@/lib/auth/tokens/refreshTokenService';
import { ErrorHandler } from '@/lib/errors/errorHandler';
import logger from '@/lib/logger';

// Validation schema for refresh token
const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = refreshSchema.parse(body);
    
    // Attempt to refresh the token
    const result = await RefreshTokenService.refreshAccessToken(validatedData.refreshToken);
    
    // Return success response with new access token
    return NextResponse.json({
      success: true,
      accessToken: result.accessToken
    });
  } catch (error) {
    logger.error('Token refresh failed', { error });
    return ErrorHandler.handleApiError(error);
  }
} 