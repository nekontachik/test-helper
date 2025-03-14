import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';
import { TokenService } from '@/lib/auth/tokenService';
import { TokenType } from '@/types/token';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const sessionId = _req.headers.get('x-session-id');

    if (!sessionId) {
      return createErrorResponse('Session ID not provided', 'ERROR_CODE', 400); }

    const isValid = await SessionService.validateSession(sessionId);

    if (!isValid) {
      return createErrorResponse('Invalid or expired session', 'ERROR_CODE', 401); }

    // Generate new access token
    const accessToken = await TokenService.generateToken({
      userId: session.user.id,
      email: session.user.email!,
      type: TokenType.ACCESS,
      expiresIn: '15m'
    });

    // Update session activity
    await SessionService.updateSessionActivity(sessionId);

    return createSuccessResponse({
      accessToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return createErrorResponse('Failed to refresh token', 'ERROR_CODE', 500);
  }
}
