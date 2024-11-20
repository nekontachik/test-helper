import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { Action, Resource } from '@/lib/auth/rbac/types';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { UserRole } from '@/types/auth';

const updateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string(),
  steps: z.string(),
  expectedResult: z.string(),
  priority: z.string(),
});

type RouteParams = {
  projectId: string;
  testCaseId: string;
};

export const PUT = withAuth<RouteParams>(
  async (request: Request, { params }: { params: RouteParams }) => {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const testCase = await prisma.testCase.update({
      where: { id: params.testCaseId },
      data,
    });

    return NextResponse.json(testCase);
  },
  {
    requireVerified: true,
    action: Action.UPDATE,
    resource: Resource.TEST_CASE,
    checkOwnership: true,
    allowTeamMembers: true,
    getProjectId: (request: Request) => request.url.split('/')[4],
    allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER]
  }
);
