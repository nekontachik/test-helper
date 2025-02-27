import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { z } from 'zod';
import { PasswordResetService } from '@/lib/auth/passwordReset';
import { withRateLimit } from '@/middleware/rateLimit';
import logger from '@/lib/logger';

// Schema for password reset request
const requestSchema = z.object({
  email: z.string().email('Invalid email address') });

// Schema for password reset completion
const resetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character') });

// Initiate password reset
async function handleRequest(request: Request) {
  try {
    const body = await _req.json();
    const { email } = requestSchema.parse(body);

    await PasswordResetService.initiateReset(email);

    // Always return success to prevent email enumeration
    return createSuccessResponse({
      message: 'If an account exists with this email, a password reset link has been sent.' }; } catch (error) {
    logger.error('Password reset request error:', error);
    return createSuccessResponse({ error: 'Failed to process reset request' }, { status: 500 }; }
}

// Complete password reset
async function handleReset(request: Request) {
  try {
    const body = await _req.json();
    const { token, password } = resetSchema.parse(body);

    await PasswordResetService.resetPassword(token, password);

    return createSuccessResponse({
      message: 'Password reset successful' }; } catch (error) {
    logger.error('Password reset error:', error);

    if (error instanceof Error) {
      return createSuccessResponse({ error: error.message }, { status: 400 }; }

    return createSuccessResponse({ error: 'Failed to reset password' }, { status: 500 }; }
}

// Route handlers with rate limiting
export const POST = withRateLimit(handleRequest, 'password-reset-request', {
  points: 5,
  duration: 300 // 5 minutes });

export const PUT = withRateLimit(handleReset, 'password-reset', {
  points: 3,
  duration: 300 // 5 minutes }); 