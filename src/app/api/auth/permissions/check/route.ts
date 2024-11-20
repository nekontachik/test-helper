import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { RBACService } from '@/lib/auth/rbac/service';
import { Action, Resource } from '@/types/rbac';
import { z } from 'zod';
import logger from '@/lib/logger';

const checkSchema = z.object({
  action: z.nativeEnum(Action),
  resource: z.nativeEnum(Resource),
  resourceId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { hasPermission: false },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, resource, resourceId } = checkSchema.parse(body);

    const hasPermission = await RBACService.checkPermission(
      session.user.id,
      session.user.role,
      {
        action,
        resource,
        resourceId
      }
    );

    logger.info('Permission check completed', {
      userId: session.user.id,
      action,
      resource,
      resourceId,
      hasPermission
    });

    return NextResponse.json({ hasPermission });
  } catch (error) {
    logger.error('Permission check error:', error);
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    );
  }
} 