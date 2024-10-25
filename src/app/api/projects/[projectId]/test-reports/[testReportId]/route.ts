import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/logger';
import { AppError, ValidationError, NotFoundError } from '@/lib/errors';

interface UpdateTestReportBody {
  title: string;  // Changed from 'name' to 'title' to match the schema
  content?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; testReportId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const testReport = await prisma.testReport.findUnique({
      where: { id: params.testReportId },
    });

    if (!testReport) {
      throw new NotFoundError('Test report not found');
    }

    if (testReport.projectId !== params.projectId) {
      throw new AppError('Test report does not belong to this project', 403);
    }

    logger.info(`Retrieved test report: ${params.testReportId}`);
    return NextResponse.json(testReport);
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test report: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in GET test report:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; testReportId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testReportId } = params;
    const body = await request.json() as UpdateTestReportBody;

    if (!body.title) {  // Changed from body.name to body.title
      throw new ValidationError('Title is required');
    }

    const existingTestReport = await prisma.testReport.findUnique({
      where: { id: testReportId },
    });

    if (!existingTestReport) {
      throw new NotFoundError('Test report not found');
    }

    if (existingTestReport.projectId !== projectId) {
      throw new AppError('Test report does not belong to the specified project', 400);
    }

    const updatedTestReport = await prisma.testReport.update({
      where: { id: testReportId },
      data: body,
    });

    logger.info(`Updated test report: ${testReportId}`, { projectId, testReportId });
    return NextResponse.json(updatedTestReport);
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in PUT test report: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in PUT test report:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; testReportId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testReportId } = params;

    const existingTestReport = await prisma.testReport.findUnique({
      where: { id: testReportId },
    });

    if (!existingTestReport) {
      throw new NotFoundError('Test report not found');
    }

    if (existingTestReport.projectId !== projectId) {
      throw new AppError('Test report does not belong to the specified project', 400);
    }

    await prisma.testReport.delete({
      where: { id: testReportId },
    });

    logger.info(`Deleted test report: ${testReportId}`, { projectId, testReportId });
    return NextResponse.json({ message: 'Test report deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in DELETE test report: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in DELETE test report:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
