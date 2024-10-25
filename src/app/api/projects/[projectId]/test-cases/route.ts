import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { testCaseSchema } from '@/lib/validation';
import { TestCaseStatus } from '@/types';

async function handler(req: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;

  if (req.method === 'GET') {
    const testCases = await prisma.testCase.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(testCases);
  }

  if (req.method === 'POST') {
    try {
      const data = await req.json();
      const validated = testCaseSchema.parse(data);

      const testCase = await prisma.testCase.create({
        data: {
          ...validated,
          projectId,
          status: TestCaseStatus.ACTIVE,
        },
      });

      return NextResponse.json(testCase, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid test case data' },
        { status: 400 }
      );
    }
  }

  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export const GET = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER, UserRole.USER]
});

export const POST = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER]
});
