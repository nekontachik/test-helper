import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { BackupCodesService } from '@/lib/auth/backupCodesService';

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
      select: { twoFactorEnabled: true },
    });

    if (!user?.twoFactorEnabled) {
      return NextResponse.json(
        { message: '2FA must be enabled to generate backup codes' },
        { status: 400 }
      );
    }

    const backupCodes = await BackupCodesService.generateCodes(session.user.id);

    return NextResponse.json({ backupCodes });
  } catch (error) {
    console.error('Backup codes generation error:', error);
    return NextResponse.json(
      { message: 'Failed to generate backup codes' },
      { status: 500 }
    );
  }
}
