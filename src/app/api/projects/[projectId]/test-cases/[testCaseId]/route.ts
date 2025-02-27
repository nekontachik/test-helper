import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/middleware/auth';
import { Action, Resource } from '@/lib/auth/rbac/types';
import { prisma } from '@/lib/prisma';
import { type UserRole } from '@/types/auth';

// Define UserRoles as an object with proper typing
const UserRoles: Record<string, UserRole> = {
  ADMIN: 'ADMIN',
  MANAGER: 'PROJECT_MANAGER',
  EDITOR: 'TESTER'
};

const updateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string(),
  steps: z.string(),
  expectedResult: z.string(),
  priority: z.string() });

type RouteParams = {
  projectId: string;
  testCaseId: string; };

export const PUT = withAuth<RouteParams>(
  async (request, { params }) => {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const testCase = await prisma.testCase.update({
      where: { id: params.testCaseId },
      data });

    return NextResponse.json(testCase); },
  {
    requireVerified: true,
    action: Action.UPDATE,
    resource: Resource.TEST_CASE,
    checkOwnership: true,
    allowTeamMembers: true,
    getProjectId: () => {
      // This function should extract the projectId from the URL
      // Since we're using the withAuth<RouteParams>, params will be available in the handler
      return ''; // This is a placeholder - the actual implementation depends on how withAuth works
    },
    allowedRoles: [UserRoles.ADMIN, UserRoles.MANAGER, UserRoles.EDITOR] }
);
