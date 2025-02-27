import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PasswordResetService } from '@/lib/auth/passwordReset';
import { withRateLimit } from '@/middleware/rateLimit';
import logger from '@/lib/logger';

// Schema for password reset request
const requestSchema = z.object({
  email: z.string().email('Invalid email address')
});

// Schema for password reset completion
const resetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

// Initiate password reset
async function handleRequest(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { email } = requestSchema.parse(body);

    await PasswordResetService.initiateReset(email);

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  } catch (error) {
    logger.error('Password reset request error:', error);
    return NextResponse.json({ error: 'Failed to process reset request' }, { status: 500 });
  }
}

// Complete password reset
async function handleReset(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { token, password } = resetSchema.parse(body);

    await PasswordResetService.resetPassword(token, password);

    return NextResponse.json({
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error('Password reset error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}

// Route handlers with rate limiting
export const POST = withRateLimit(handleRequest, 'password-reset-request', {
  maxRequests: 5,
  windowMs: 300000 // 5 minutes
});

export const PUT = withRateLimit(handleReset, 'password-reset', {
  maxRequests: 3,
  windowMs: 300000 // 5 minutes
}); 