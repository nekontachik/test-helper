import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true, emailVerified: true },
    });

    if (!user?.emailVerified) {
      return NextResponse.json(
        { message: 'Email must be verified to enable 2FA' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: !user.twoFactorEnabled },
      select: { twoFactorEnabled: true },
    });

    return NextResponse.json({
      twoFactorEnabled: updatedUser.twoFactorEnabled,
    });
  } catch (error) {
    console.error('2FA toggle error:', error);
    return NextResponse.json(
      { message: 'Failed to toggle 2FA' },
      { status: 500 }
    );
  }
}
