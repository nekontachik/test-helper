import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { OwnershipService } from '@/lib/auth/ownership/service';
import { z } from 'zod';

const checkSchema = z.object({
  resourceType: z.enum(['project', 'testCase', 'testRun']),
  resourceId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { resourceType, resourceId } = checkSchema.parse(body);

    let isOwner = false;
    let isTeamMember = false;
    const userId = session.user.id;

    switch (resourceType) {
      case 'project':
        isOwner = await OwnershipService.isProjectOwner(userId, resourceId);
        isTeamMember = await OwnershipService.isTeamMember(userId, resourceId);
        break;

      case 'testCase':
        isOwner = await OwnershipService.isTestCaseOwner(userId, resourceId);
        const testCase = await prisma.testCase.findUnique({
          where: { id: resourceId },
          select: { projectId: true },
        });
        if (testCase) {
          isTeamMember = await OwnershipService.isTeamMember(userId, testCase.projectId);
        }
        break;

      case 'testRun':
        isOwner = await OwnershipService.isTestRunOwner(userId, resourceId);
        const testRun = await prisma.testRun.findUnique({
          where: { id: resourceId },
          select: { projectId: true },
        });
        if (testRun) {
          isTeamMember = await OwnershipService.isTeamMember(userId, testRun.projectId);
        }
        break;
    }

    return NextResponse.json({ isOwner, isTeamMember });
  } catch (error) {
    console.error('Ownership check error:', error);
    return NextResponse.json(
      { error: 'Failed to check ownership' },
      { status: 500 }
    );
  }
} 