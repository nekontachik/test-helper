import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { testSuiteSchema } from '@/lib/validation';

async function handler(req: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;

  if (req.method === 'GET') {
    const testSuites = await prisma.testSuite.findMany({
      where: { projectId },
      include: {
        testCases: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(testSuites);
  }

  if (req.method === 'POST') {
    try {
      const data = await req.json();
      const validated = testSuiteSchema.parse(data);

      const testSuite = await prisma.testSuite.create({
        data: {
          ...validated,
          projectId,
          testCases: {
            connect: validated.testCaseIds?.map(id => ({ id })) || [],
          },
        },
        include: {
          testCases: true,
        },
      });

      return NextResponse.json(testSuite, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid test suite data' },
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
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER]
});
