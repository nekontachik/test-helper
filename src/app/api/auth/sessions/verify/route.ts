import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';
import { z } from 'zod';

const verifySchema = z.object({
  sessionId: z.string().min(1) });

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401); }

    const body = await _req.json();
    const { sessionId } = verifySchema.parse(body);

    const isValid = await SessionService.validateSession(sessionId);

    if (!isValid) {
      return createErrorResponse('Invalid or expired session', 'ERROR_CODE', 401); }

    // Update session activity
    await SessionService.updateSessionActivity(sessionId);

    return createSuccessResponse({
      valid: true,
      message: 'Session is valid' }; } catch (error) {
    console.error('Session verification error:', error);
    return createErrorResponse('Failed to verify session', 'ERROR_CODE', 500); }
}
