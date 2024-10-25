import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { testRunSchema } from '@/lib/validation';
import { TestRunStatus } from '@/types';

async function handler(req: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;

  if (req.method === 'GET') {
    const testRuns = await prisma.testRun.findMany({
      where: { projectId },
      include: {
        testCases: true,
        testCaseResults: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(testRuns);
  }

  if (req.method === 'POST') {
    try {
      const data = await req.json();
      const validated = testRunSchema.parse(data);

      const testRun = await prisma.testRun.create({
        data: {
          ...validated,
          projectId,
          status: TestRunStatus.PENDING,
          testCases: {
            connect: validated.testCaseIds.map(id => ({ id })),
          },
        },
        include: {
          testCases: true,
        },
      });

      return NextResponse.json(testRun, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid test run data' },
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
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER]
});

export const POST = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER]
});
