import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AppError, ValidationError } from '@/lib/errors';
import logger from '@/lib/logger';
import { Prisma } from '@prisma/client';
import { TestCaseFormData, TestCaseStatus, TestCasePriority } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testCaseId } = params;

    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId, projectId },
    });

    if (!testCase) {
      throw new AppError('Test case not found', 404);
    }

    return NextResponse.json(testCase);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test case: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in GET test case:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testCaseId } = params;
    const body: Partial<TestCaseFormData> = await request.json();

    // Input validation
    if (body.title !== undefined && body.title.trim().length === 0) {
      throw new ValidationError('Title cannot be empty');
    }
    if (body.description !== undefined && body.description.trim().length === 0) {
      throw new ValidationError('Description cannot be empty');
    }
    if (body.status !== undefined && !Object.values(TestCaseStatus).includes(body.status)) {
      throw new ValidationError('Invalid status');
    }
    if (body.priority !== undefined && !Object.values(TestCasePriority).includes(body.priority)) {
      throw new ValidationError('Invalid priority');
    }

    const existingTestCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!existingTestCase) {
      throw new AppError('Test case not found', 404);
    }

    if (existingTestCase.projectId !== projectId) {
      throw new AppError('Test case does not belong to the specified project', 400);
    }

    const updatedTestCase = await prisma.$transaction(async (prisma) => {
      // Create a new version
      await prisma.testCaseVersion.create({
        data: {
          testCaseId: existingTestCase.id,
          versionNumber: existingTestCase.version,
          title: existingTestCase.title,
          description: existingTestCase.description,
          steps: existingTestCase.steps,
          expectedResult: existingTestCase.expectedResult,
          actualResult: existingTestCase.actualResult,
          status: existingTestCase.status,
          priority: existingTestCase.priority,
        },
      });

      // Update the test case
      return prisma.testCase.update({
        where: { id: testCaseId },
        data: {
          ...body,
          version: { increment: 1 },
        },
      });
    });

    logger.info(`Updated test case ${testCaseId} for project ${projectId}`);
    return NextResponse.json(updatedTestCase);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      logger.warn(`AppError in PUT test case: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      logger.warn(`Test case not found: ${params.testCaseId}`);
      return NextResponse.json({ error: 'Test case not found' }, { status: 404 });
    }
    logger.error('Unexpected error in PUT test case:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testCaseId } = params;

    const existingTestCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!existingTestCase) {
      throw new AppError('Test case not found', 404);
    }

    if (existingTestCase.projectId !== projectId) {
      throw new AppError('Test case does not belong to the specified project', 400);
    }

    await prisma.testCase.delete({
      where: { id: testCaseId },
    });

    logger.info(`Deleted test case: ${testCaseId}`, { projectId, testCaseId });
    return NextResponse.json({ message: 'Test case deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in DELETE test case: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in DELETE test case:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
