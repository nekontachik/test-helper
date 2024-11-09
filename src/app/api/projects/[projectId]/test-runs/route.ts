import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { testRunSchema } from '@/lib/validation';
import { TestRunStatus } from '@/types';
import { getServerSession } from 'next-auth/next';

async function handler(req: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;

  if (req.method === 'GET') {
    try {
      const testRuns = await prisma.testRun.findMany({
        where: { projectId },
        include: {
          testRunCases: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(testRuns);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid test run data' },
        { status: 400 }
      );
    }
  }

  if (req.method === 'POST') {
    try {
      const data = await req.json();
      const validated = testRunSchema.parse(data);
      const session = await getServerSession();
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }

      const testRun = await prisma.testRun.create({
        data: {
          name: validated.name,
          projectId,
          status: TestRunStatus.PENDING,
          userId: session.user.id,
          testRunCases: {
            connect: validated.testCaseIds.map(id => ({ id })),
          },
        },
        include: {
          testRunCases: true,
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
