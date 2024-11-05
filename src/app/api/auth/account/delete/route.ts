import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { SecurityService } from '@/lib/auth/securityService';
import { ActivityService } from '@/lib/auth/activityService';
import { authOptions } from '../../[...nextauth]/route';

const deleteSchema = z.object({
  password: z.string(),
  confirmPhrase: z.literal('DELETE'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { password, confirmPhrase } = deleteSchema.parse(
      await request.json()
    );

    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const userAgent = request.headers.get('user-agent');

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user || !await SecurityService.verifyPassword(password, user.password)) {
      await ActivityService.log(session.user.id, 'ACCOUNT_DELETE_FAILED', {
        ip,
        userAgent,
        metadata: { reason: 'invalid_password' },
      });
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 400 }
      );
    }

    // Schedule account for deletion
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30); // 30 days grace period

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        scheduledDeletion: deletionDate,
        status: 'PENDING_DELETION',
      },
    });

    await ActivityService.log(session.user.id, 'ACCOUNT_DELETE_SCHEDULED', {
      ip,
      userAgent,
      metadata: { scheduledDate: deletionDate },
    });

    return NextResponse.json({
      message: 'Account scheduled for deletion',
      deletionDate,
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
