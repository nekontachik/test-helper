import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { AppError, NotFoundError } from '@/lib/errors';
import type { TestCase, Version } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const testCase = await prisma.testCase.findUnique({
      where: { 
        id: params.testCaseId,
        projectId: params.projectId
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            versionNumber: true,
            title: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!testCase) {
      throw new NotFoundError('Test case not found');
    }

    const totalCount = await prisma.version.count({
      where: {
        testCaseId: params.testCaseId
      }
    });

    if (!testCase.versions?.length) {
      throw new NotFoundError('No versions found for this test case');
    }

    logger.info(`Retrieved versions for test case: ${params.testCaseId}`);
    return NextResponse.json({
      data: testCase.versions,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test case versions: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in GET test case versions:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
