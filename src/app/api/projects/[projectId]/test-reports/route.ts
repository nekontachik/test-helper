import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { AppError, NotFoundError, ValidationError } from '@/lib/errors';
import logger from '@/lib/logger';

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

    const [testReports, totalCount] = await Promise.all([
      prisma.testReport.findMany({
        where: { projectId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.testReport.count({ where: { projectId } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    logger.info(`Retrieved test reports for project ${projectId}`, { page, limit });
    return NextResponse.json({
      items: testReports,
      currentPage: page,
      totalPages,
      totalCount,
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test reports: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in GET test reports:', error);
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

    if (!body.name || !body.testRunId) {
      throw new ValidationError('Name and testRunId are required');
    }

    const newTestReport = await prisma.testReport.create({
      data: {
        ...body,
        projectId,
      },
    });

    logger.info(`Created new test report for project ${projectId}`, { testReportId: newTestReport.id });
    return NextResponse.json(newTestReport, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in POST test report: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in POST test report:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
