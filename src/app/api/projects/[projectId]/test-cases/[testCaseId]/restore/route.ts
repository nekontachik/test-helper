import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testCaseId } = params;
    const { versionNumber } = await request.json();

    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId, projectId },
      include: { versions: true },
    });

    if (!testCase) {
      throw new AppError('Test case not found', 404);
    }

    const versionToRestore = await prisma.version.findFirst({
      where: {
        testCaseId,
        versionNumber,
      },
    });

    if (!versionToRestore) {
      throw new AppError('Version not found', 404);
    }

    const restoredTestCase = await prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        title: versionToRestore.title,
        description: versionToRestore.description,
        expectedResult: versionToRestore.expectedResult,
        status: versionToRestore.status,
        priority: versionToRestore.priority,
        versions: {
          create: {
            versionNumber: testCase.versions.length + 1,
            title: testCase.title,
            description: testCase.description,
            expectedResult: testCase.expectedResult,
            status: testCase.status,
            priority: testCase.priority,
          },
        },
      },
      include: { versions: true },
    });

    logger.info(`Restored test case ${testCaseId} to version ${versionNumber}`);
    return NextResponse.json(restoredTestCase);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      logger.warn(`AppError in POST restore test case: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in POST restore test case:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
