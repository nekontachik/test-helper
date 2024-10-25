import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SecurityService } from '@/lib/auth/securityService';
import { z } from 'zod';

const deleteSchema = z.object({
  password: z.string().min(1),
  reason: z.string().optional(),
});

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password, reason } = deleteSchema.parse(body);

    // Verify password
    const isValid = await SecurityService.verifyPassword(
      session.user.id,
      password
    );

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid password' },
        { status: 400 }
      );
    }

    // Log account deletion
    await prisma.accountDeletionLog.create({
      data: {
        userId: session.user.id,
        reason: reason || 'No reason provided',
      },
    });

    // Delete user data
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { message: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
