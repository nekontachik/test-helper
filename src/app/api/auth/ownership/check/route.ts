import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import { createSuccessResponse } from '@/types/api';
import { authOptions } from '@/lib/auth';
import { OwnershipService } from '@/lib/auth/ownership/service';
import { prisma } from '@/lib/prisma';
import { AuthenticationError, ValidationError } from '@/lib/errors';
import { handleApiError } from '@/lib/api/errorHandler';

type ResourceType = 'project' | 'testCase' | 'testRun';

const checkSchema = z.object({
  resourceType: z.enum(['project', 'testCase', 'testRun']),
  resourceId: z.string()
});

export async function POST(
  _req: NextRequest
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const body = await _req.json();
    const validatedBody = checkSchema.safeParse(body);
    
    if (!validatedBody.success) {
      throw new ValidationError(`Invalid request body: ${validatedBody.error.message}`);
    }

    const { resourceType, resourceId } = validatedBody.data;
    const userId = session.user.id;

    const [isOwner, isTeamMember] = await Promise.all([
      getOwnership(resourceType, userId, resourceId),
      getTeamMembership(resourceType, userId, resourceId)
    ]);

    return NextResponse.json(
      createSuccessResponse({ isOwner, isTeamMember }),
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

async function getOwnership(
  resourceType: ResourceType,
  userId: string,
  resourceId: string
): Promise<boolean> {
  switch (resourceType) {
    case 'project':
      return OwnershipService.isProjectOwner(userId, resourceId);
    case 'testCase':
      return OwnershipService.isTestCaseOwner(userId, resourceId);
    case 'testRun':
      return OwnershipService.isTestRunOwner(userId, resourceId);
  }
}

async function getTeamMembership(
  resourceType: ResourceType,
  userId: string,
  resourceId: string
): Promise<boolean> {
  let projectId: string | null = null;

  switch (resourceType) {
    case 'project':
      projectId = resourceId;
      break;
    case 'testCase': {
      const testCase = await prisma.testCase.findUnique({
        where: { id: resourceId },
        select: { projectId: true }
      });
      projectId = testCase?.projectId ?? null;
      break;
    }
    case 'testRun': {
      const testRun = await prisma.testRun.findUnique({
        where: { id: resourceId },
        select: { projectId: true }
      });
      projectId = testRun?.projectId ?? null;
      break;
    }
  }

  return projectId ? OwnershipService.isTeamMember(userId, projectId) : false;
}
