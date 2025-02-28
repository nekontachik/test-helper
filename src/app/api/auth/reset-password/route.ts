import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/services/authService';
import logger from '@/lib/utils/logger';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

const authService = new AuthService();

export async function POST(request: Request): Promise<NextResponse> {
  try {
    logger.info('Processing password reset request');
    
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Validate token first
    const isValidToken = await authService.validateResetToken(validatedData.token);
    if (!isValidToken) {
      logger.warn('Invalid or expired reset token');
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Reset password
    await authService.resetPassword(validatedData.token, validatedData.password);

    logger.info('Password reset successful');
    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid password reset data', { error: error.errors });
      return NextResponse.json(
        { message: 'Invalid input', errors: error.errors },
        { status: 400 }
      );
    }

    logger.error('Password reset failed', { error });
    return NextResponse.json(
      { message: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

export async function PUT(_request: NextRequest): Promise<ApiResponse<unknown>> {
  // Complete password reset
  return createErrorResponse('Not implemented', 'NOT_IMPLEMENTED', 501);
}
