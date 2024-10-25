import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/logger';
import { AppError, ValidationError } from '@/lib/errors';

interface TestReportInput {
  title: string;
  content: string;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId } = params;

    const testReports = await prisma.testReport.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`Retrieved test reports for project ${projectId}`);
    return NextResponse.json(testReports);
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
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId } = params;
    const body = await request.json() as TestReportInput;

    if (!body.title) {
      throw new ValidationError('Title is required');
    }

    const newTestReport = await prisma.testReport.create({
      data: {
        title: body.title,
        content: body.content,
        project: {
          connect: { id: projectId }
        }
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`Created test report for project ${projectId}`, { reportId: newTestReport.id });
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
