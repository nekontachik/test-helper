import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AuditService, AuditAction } from '@/lib/audit/auditService';
import { AuditLogType } from '@/types/audit';
import type { JWT } from 'next-auth/jwt';
import type { AuditLogData } from '@/lib/audit/auditService';

export async function auditLogMiddleware(request: Request): Promise<Response> {
  try {
    const token = await getToken({ req: request as any }) as JWT & { sub: string };
    
    if (!token?.sub) {
      return NextResponse.next();
    }

    const auditData: AuditLogData = {
      type: AuditLogType.SYSTEM,
      userId: token.sub,
      action: AuditAction.API_REQUEST,
      metadata: {
        method: request.method,
        path: new URL(request.url).pathname,
      },
      context: {
        ip: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      }
    };

    await AuditService.log(auditData);

    return NextResponse.next();
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't block the request if audit logging fails
    return NextResponse.next();
  }
} 