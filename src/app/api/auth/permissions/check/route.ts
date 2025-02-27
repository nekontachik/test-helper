import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { RBACService } from '@/lib/auth/rbac/service';
import { Action, Resource } from '@/types/rbac';
import { z } from 'zod';
import logger from '@/lib/logger';

const checkSchema = z.object({
  action: z.nativeEnum(Action),
  resource: z.nativeEnum(Resource),
  resourceId: z.string().optional() });

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createSuccessResponse({ hasPermission: false }, { status: 401 }; }

    const body = await _req.json();
    const { action, resource, resourceId } = checkSchema.parse(body);

    const hasPermission = await RBACService.checkPermission(
      session.user.id,
      session.user.role,
      {
        action,
        resource,
        resourceId }
    );

    logger.info('Permission check completed', {
      userId: session.user.id,
      action,
      resource,
      resourceId,
      hasPermission });

    return createSuccessResponse({ hasPermission }; } catch (error) {
    logger.error('Permission check error:', error);
    return createSuccessResponse({ error: 'Failed to check permissions' }, { status: 500 }; }
}
