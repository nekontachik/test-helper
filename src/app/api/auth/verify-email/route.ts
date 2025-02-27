import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { AuthService } from '@/lib/auth/authService';
import { checkRateLimit } from '@/lib/auth/rateLimit';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string() });

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const ip = _req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`verify_email_${ip}`);

    if (!rateLimitResult.success) {
      return createErrorResponse('Too many requests', 'ERROR_CODE', 429); }

    const body = await _req.json();
    const { token } = verifySchema.parse(body);

    await AuthService.verifyEmail(token);

    return createSuccessResponse({
      message: 'Email verified successfully' }; } catch (error) {
    console.error('Email verification error:', error);
    return createSuccessResponse({ error: error instanceof Error ? error.message : 'Verification failed' }, { status: 400 }; }
}
