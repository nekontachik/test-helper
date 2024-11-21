import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { BackupCodesService } from '@/lib/auth/backupCodesService';
import { z } from 'zod';

const recoverySchema = z.object({
  code: z.string().length(8),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = recoverySchema.parse(body);

    const isValid = await BackupCodesService.verifyCode(session.user.id, code);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid recovery code' },
        { status: 400 }
      );
    }

    // Generate new backup codes after successful recovery
    const newBackupCodes = await BackupCodesService.generateCodes(session.user.id);

    return NextResponse.json({
      message: 'Recovery successful',
      backupCodes: newBackupCodes,
    });
  } catch (error) {
    console.error('2FA recovery error:', error);
    return NextResponse.json(
      { message: 'Failed to process recovery' },
      { status: 500 }
    );
  }
}
