import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { AppError, ValidationError } from '@/lib/errors';
import logger from '@/lib/logger';
import { TestRunStatus } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [testRuns, totalCount] = await Promise.all([
      prisma.testRun.findMany({
        where: { projectId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.testRun.count({ where: { projectId } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    logger.info(`Retrieved test runs for project ${projectId}`, { page, limit });
    return NextResponse.json({
      items: testRuns,
      currentPage: page,
      totalPages,
      totalCount,
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test runs: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in GET test runs:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId } = params;
    const body = await request.json();

    if (!body.name) {
      throw new ValidationError('Name is required');
    }

    const newTestRun = await prisma.testRun.create({
      data: {
        ...body,
        projectId,
        status: TestRunStatus.IN_PROGRESS,
      },
    });

    logger.info(`Created new test run for project ${projectId}`, { testRunId: newTestRun.id });
    return NextResponse.json(newTestRun, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in POST test run: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in POST test run:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
