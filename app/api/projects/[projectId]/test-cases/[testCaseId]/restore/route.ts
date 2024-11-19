import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppError, NotFoundError } from '@/lib/errors';
import logger from '@/lib/logger';
import type { Prisma, TestCase } from '@prisma/client';

interface RestoreVersionBody {
  versionNumber: number;
}

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
    const body = await request.json() as RestoreVersionBody;

    // Use a transaction to ensure data consistency
    const testCase = await prisma.$transaction(async (tx) => {
      const currentVersion = await tx.version.findFirst({
        where: { 
          testCaseId,
          versionNumber: body.versionNumber
        },
        select: {
          title: true,
          description: true,
          steps: true,
          expectedResult: true,
          status: true,
          priority: true,
        }
      });

      if (!currentVersion) {
        throw new NotFoundError('Version not found');
      }

      const versionCount = await tx.version.count({
        where: { testCaseId }
      });

      const updatedTestCase = await tx.testCase.update({
        where: { id: testCaseId },
        data: {
          ...currentVersion,
          versions: {
            create: {
              versionNumber: versionCount + 1,
              steps: currentVersion.steps,
              title: currentVersion.title,
              description: currentVersion.description,
              expectedResult: currentVersion.expectedResult,
              status: currentVersion.status,
              priority: currentVersion.priority
            }
          }
        },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1
          }
        }
      });

      return updatedTestCase;
    });

    logger.info(`Restored test case version: ${testCaseId}`, { projectId, versionNumber: body.versionNumber });
    return NextResponse.json(testCase);
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in POST restore version: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in POST restore version:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
