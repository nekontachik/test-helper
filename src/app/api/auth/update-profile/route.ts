import { type NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional()
});

export async function PUT(_req: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'ERROR_CODE', 401),
        { status: 401 }
      );
    }

    const body = await _req.json();
    const { name } = updateProfileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to update profile', 'ERROR_CODE', 500),
      { status: 500 }
    );
  }
}
