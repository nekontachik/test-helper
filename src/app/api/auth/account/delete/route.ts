import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ActivityService } from '@/lib/auth/activityService';
import { ActivityEventType } from '@/types/activity';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  const session = await getServerSession(authOptions);

  try {
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'ERROR_CODE', 401);
    }

    // Schedule account for deletion in 30 days
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        scheduledDeletion: deletionDate
      }
    });

    await ActivityService.log(session.user.id, ActivityEventType.ACCOUNT_DELETION_SCHEDULED, {
      metadata: {
        scheduledDate: deletionDate
      }
    });

    return createSuccessResponse({
      message: 'Account scheduled for deletion',
      scheduledDate: deletionDate
    });
  } catch (error) {
    console.error('Account deletion scheduling error:', error);
    
    if (session?.user) {
      await ActivityService.log(session.user.id, ActivityEventType.ACCOUNT_DELETION_FAILED, {
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    return createErrorResponse('Failed to schedule account deletion', 'ERROR_CODE', 500);
  }
}
