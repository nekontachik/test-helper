import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { PrismaErrorHandler } from '@/lib/prismaErrorHandler';

interface TestCaseVersion {
  id: string;
  versionNumber: number;
  title: string;
  description: string | null;
  expectedResult: string | null;
  status: string;
  priority: string;
  testCaseId: string;
  createdAt: Date;
}

async function handler(
  req: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  const { projectId, testCaseId } = params;

  try {
    if (req.method === 'GET') {
      const versions = await prisma.version.findMany({
        where: { testCaseId },
        orderBy: { versionNumber: 'desc' },
      });
      return NextResponse.json(versions);
    }

    if (req.method === 'POST') {
      const data = await req.json();
      const { versionNumber } = data;

      const version = await prisma.version.findFirst({
        where: {
          testCaseId,
          versionNumber,
        },
      });

      if (!version) {
        return NextResponse.json(
          { message: 'Version not found' },
          { status: 404 }
        );
      }

      // Restore the version
      const updatedTestCase = await prisma.testCase.update({
        where: { id: testCaseId },
        data: {
          title: version.title,
          description: version.description,
          expectedResult: version.expectedResult,
          status: version.status,
          priority: version.priority,
        },
      });

      return NextResponse.json({
        message: 'Version restored successfully',
        testCase: updatedTestCase,
      });
    }

    return NextResponse.json(
      { message: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    const { message, status } = PrismaErrorHandler.handle(error);
    return NextResponse.json({ message }, { status });
  }
}

export const GET = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER, UserRole.USER]
});

export const POST = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER]
});
