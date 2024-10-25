import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
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
      select: { emailVerified: true },
    });

    return NextResponse.json({
      isVerified: !!user?.emailVerified,
    });
  } catch (error) {
    console.error('Verification status check error:', error);
    return NextResponse.json(
      { message: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}
