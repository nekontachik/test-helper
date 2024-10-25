import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';  // Changed from default import to named import
import { AppError, NotFoundError, ValidationError } from '@/lib/errors';
import logger from '@/lib/logger';
import type { TestRun } from '@prisma/client';

interface UpdateTestRunInput {
  name?: string;
  status?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; testRunId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testRunId } = params;

    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
      include: { testCases: true },
    });

    if (!testRun) {
      throw new NotFoundError('Test run not found');
    }

    if (testRun.projectId !== projectId) {
      throw new AppError('Test run does not belong to the specified project', 400);
    }

    logger.info(`Retrieved test run: ${testRunId}`, { projectId, testRunId });
    return NextResponse.json(testRun);
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test run: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in GET test run:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; testRunId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const body = await request.json() as UpdateTestRunInput;
    const { projectId, testRunId } = params;

    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
    });

    if (!testRun) {
      throw new NotFoundError('Test run not found');
    }

    if (testRun.projectId !== projectId) {
      throw new AppError('Test run does not belong to the specified project', 400);
    }

    const updatedTestRun = await prisma.testRun.update({
      where: { id: testRunId },
      data: body,
    });

    logger.info(`Updated test run: ${testRunId}`, { projectId, testRunId });
    return NextResponse.json(updatedTestRun);
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in PUT test run: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in PUT test run:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; testRunId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testRunId } = params;

    const existingTestRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
    });

    if (!existingTestRun) {
      throw new NotFoundError('Test run not found');
    }

    if (existingTestRun.projectId !== projectId) {
      throw new AppError('Test run does not belong to the specified project', 400);
    }

    await prisma.testRun.delete({
      where: { id: testRunId },
    });

    logger.info(`Deleted test run: ${testRunId}`, { projectId, testRunId });
    return NextResponse.json({ message: 'Test run deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in DELETE test run: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in DELETE test run:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
