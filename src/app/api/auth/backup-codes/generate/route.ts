import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

function generateBackupCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

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

    // Generate 10 backup codes
    const codes = Array.from({ length: 10 }, generateBackupCode);
    const hashedCodes = await Promise.all(
      codes.map(code => bcrypt.hash(code, 12))
    );

    // Store hashed backup codes
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        backupCodes: hashedCodes,
      },
    });

    return NextResponse.json({ codes });
  } catch (error) {
    console.error('Backup codes generation error:', error);
    return NextResponse.json(
      { message: 'Failed to generate backup codes' },
      { status: 500 }
    );
  }
}
