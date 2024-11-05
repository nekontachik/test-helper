import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { RBACService } from '@/lib/auth/rbac/service';
import { Action, Resource } from '@/lib/auth/rbac/types';

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

    const testCase = await prisma.testCase.findUnique({
      where: { id: params.testCaseId },
      select: {
        userId: true,
        status: true,
        project: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!testCase) {
      return NextResponse.json(
        { error: 'Test case not found' },
        { status: 404 }
      );
    }

    const hasPermission = RBACService.can(
      session.user.role,
      Action.UPDATE,
      Resource.TEST_CASE,
      {
        userId: session.user.id,
        resourceOwnerId: testCase.userId,
        projectOwnerId: testCase.project.userId,
        status: testCase.status,
      }
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatedTestCase = await prisma.testCase.update({
      where: { id: params.testCaseId },
      data: body,
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