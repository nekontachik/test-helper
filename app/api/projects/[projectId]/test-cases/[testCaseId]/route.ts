import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppError, NotFoundError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const testCase = await prisma.testCase.findUnique({
      where: { id: params.testCaseId },
      include: {
        versions: {  // Lowercase because it's the relation name
          orderBy: { versionNumber: 'desc' },
          take: 10,
          select: {
            id: true,
            versionNumber: true,
            title: true,
            status: true,
            createdAt: true  // Changed from updatedAt to createdAt which exists in schema
          }
        }
      },
    });

    if (!testCase) {
      throw new NotFoundError('Test case not found');
    }

    if (testCase.projectId !== params.projectId) {
      throw new AppError('Test case does not belong to this project', 403);
    }

    logger.info(`Retrieved test case: ${params.testCaseId}`);
    return NextResponse.json(testCase);
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test case: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in GET test case:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
