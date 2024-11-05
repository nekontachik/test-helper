import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { OwnershipService } from '@/lib/auth/ownership/service';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  steps: z.string().optional(),
  expectedResult: z.string().optional(),
  priority: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { testCaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isOwner = await OwnershipService.isTestCaseOwner(
      session.user.id,
      params.testCaseId
    );

    if (!isOwner) {
      return NextResponse.json(
        { error: 'You do not have permission to update this test case' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const updatedTestCase = await prisma.testCase.update({
      where: { id: params.testCaseId },
      data,
    });

    return NextResponse.json(updatedTestCase);
  } catch (error) {
    console.error('Test case update error:', error);
    return NextResponse.json(
      { error: 'Failed to update test case' },
      { status: 500 }
    );
  }
} 