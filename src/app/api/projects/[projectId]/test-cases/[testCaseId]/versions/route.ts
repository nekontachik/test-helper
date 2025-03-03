import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaErrorHandler } from '@/lib/prismaErrorHandler';
import { protect } from '@/lib/auth/protect';
import type { Session } from 'next-auth';
import type { UserRole } from '@/types/auth';

async function handler(
  req: Request,
  context: { params: Record<string, string>; session: Session }
): Promise<NextResponse> {
  const testCaseId = context.params.testCaseId;
  
  if (!testCaseId) {
    return NextResponse.json({ error: 'Test case ID is required' }, { status: 400 });
  }

  try {
    if (req.method === 'GET') {
      const versions = await prisma.version.findMany({
        where: { testCaseId },
        orderBy: { versionNumber: 'desc' }
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
        }
      });

      if (!version) {
        return NextResponse.json(
          { error: 'Version not found' },
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
        }
      });

      return NextResponse.json({
        message: 'Version restored successfully',
        testCase: updatedTestCase
      });
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    const { message, status } = PrismaErrorHandler.handle(error);
    return NextResponse.json({ message }, { status });
  }
}

export const GET = protect(handler, {
  roles: ['ADMIN', 'PROJECT_MANAGER', 'TESTER', 'USER'] as UserRole[]
});

export const POST = protect(handler, {
  roles: ['ADMIN', 'PROJECT_MANAGER', 'TESTER'] as UserRole[]
});
