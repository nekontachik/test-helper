import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppError, NotFoundError } from '@/lib/errors';
import logger from '@/lib/logger';
import type { Prisma, TestCase } from '@prisma/client';

// Define the Version type inline since we can't import it directly
type Version = Prisma.VersionGetPayload<{
  select: {
    id: true;
    versionNumber: true;
    title: true;
    status: true;
    createdAt: true;
  }
}>;

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
): Promise<NextResponse<TestCase & { versions: Version[] } | { error: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const testCase = await prisma.testCase.findUnique({
      where: { 
        id: params.testCaseId,
        projectId: params.projectId
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 10,
          select: {
            id: true,
            versionNumber: true,
            title: true,
            status: true,
            createdAt: true
          }
        }
      },
    });

    if (!testCase) {
      throw new NotFoundError('Test case not found');
    }

    const response = {
      ...testCase,
      versions: testCase.versions || []
    };

    logger.info(`Retrieved test case: ${params.testCaseId}`);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test case: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in GET test case:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
