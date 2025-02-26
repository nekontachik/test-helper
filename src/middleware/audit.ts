import { AuditService } from '@/lib/audit/auditService';
import { AuditLogType } from '@/types/audit';
import logger from '@/lib/logger';
import type { Session } from 'next-auth';

interface AuditParams {
  request: Request;
  session: Session | null;
  action: string;
  metadata?: ((req: Request) => Promise<Record<string, unknown>>) | Record<string, unknown>;
}

export async function auditLogMiddleware(
  params: AuditParams
): Promise<void> {
  try {
    const metadata = typeof params.metadata === 'function'
      ? await params.metadata(params.request)
      : params.metadata ?? {
          method: params.request.method,
          path: params.request.url,
          ip: params.request.headers.get('x-forwarded-for'),
          userAgent: params.request.headers.get('user-agent'),
        };

    await AuditService.log({
      type: AuditLogType.SYSTEM,
      userId: params.session?.user?.id || 'system',
      action: params.action,
      metadata,
    });
  } catch (error) {
    logger.error('Audit middleware error:', error);
  }
} 