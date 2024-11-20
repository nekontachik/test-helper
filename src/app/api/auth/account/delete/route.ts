import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ActivityService } from '@/lib/auth/activityService';
import { ActivityEventType } from '@/types/activity';
import { addDays } from 'date-fns';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  try {
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Schedule account for deletion in 30 days
    const deletionDate = addDays(new Date(), 30);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        scheduledDeletion: deletionDate
      }
    });

    await ActivityService.log(session.user.id, ActivityEventType.ACCOUNT_DELETE_SCHEDULED, {
      metadata: {
        scheduledDate: deletionDate
      }
    });

    return NextResponse.json({
      message: 'Account scheduled for deletion',
      scheduledDate: deletionDate
    });
  } catch (error) {
    console.error('Account deletion scheduling error:', error);
    
    if (session?.user) {
      await ActivityService.log(session.user.id, ActivityEventType.ACCOUNT_DELETE_FAILED, {
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }

    return NextResponse.json(
      { message: 'Failed to schedule account deletion' },
      { status: 500 }
    );
  }
}
