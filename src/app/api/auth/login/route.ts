import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/authService';
import { AuditService } from '@/lib/audit/auditService';
import { AuditAction, AuditLogType } from '@/types/audit';
import { z } from 'zod';
import { handleApiError } from '@/lib/apiErrorHandler';

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  metadata: z.object({
    ip: z.string().optional(),
    userAgent: z.string().optional(),
  }).optional(),
});

export async function POST(req: Request) {
  try {
    // Validate request body
    const body = await req.json();
    const { email, password, metadata } = loginSchema.parse(body);

    // Authenticate user
    const result = await AuthService.login({
      email,
      password,
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
    });

    // Log successful login
    await AuditService.log({
      type: AuditLogType.AUTH,
      userId: result.user.id,
      action: AuditAction.USER_LOGIN,
      metadata: {
        email,
        ipAddress: metadata?.ip,
        userAgent: metadata?.userAgent
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
} 