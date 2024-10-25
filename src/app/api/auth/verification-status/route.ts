import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = emailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isVerified: !!user.emailVerified,
    });
  } catch (error) {
    console.error('Verification status check error:', error);
    return NextResponse.json(
      { message: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}
