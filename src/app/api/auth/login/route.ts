import { type NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/authService';
import { AuditService } from '@/lib/audit/auditService';
import { AuditAction, AuditLogType } from '@/types/audit';
import { z } from 'zod';
import { handleApiError } from '@/lib/apiErrorHandler';
import logger from '@/lib/logger';

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  metadata: z.object({
    ip: z.string().optional(),
    userAgent: z.string().optional() }).optional() });

export async function POST(_req: NextRequest): Promise<Response> {
  try {
    // Validate request body
    const body = await _req.json();
    const { email, password, metadata } = loginSchema.parse(body);

    // Authenticate user
    const result = await AuthService.login({
      email,
      password,
      ip: metadata?.ip,
      userAgent: metadata?.userAgent });

    // Log successful login
    await AuditService.log({
      type: AuditLogType.SECURITY,
      userId: result.user.id,
      action: AuditAction.USER_LOGIN,
      metadata: {
        email,
        ipAddress: metadata?.ip,
        userAgent: metadata?.userAgent } });

    logger.info('User logged in successfully', {
      userId: result.user.id,
      ip: metadata?.ip });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Login failed:', error);
    return handleApiError(error);
  }
}
