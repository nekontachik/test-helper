import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
    const { projectId, testCaseId } = params;
    const body = await request.json();

    const existingTestCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: { versions: true },
    });

    if (!existingTestCase) {
      throw new AppError('Test case not found', 404);
    }

    const updatedTestCase = await prisma.$transaction(async (tx) => {
      // Create a new version with current state
      await tx.version.create({
        data: {
          testCaseId: existingTestCase.id,
          versionNumber: existingTestCase.versions.length + 1,
          title: existingTestCase.title,
          description: existingTestCase.description,
          expectedResult: existingTestCase.expectedResult,
          status: existingTestCase.status,
          priority: existingTestCase.priority,
          steps: existingTestCase.steps || '', // Add default value
        },
      });

      // Update the test case
      return tx.testCase.update({
        where: { id: testCaseId },
        data: {
          title: body.title,
          description: body.description,
          expectedResult: body.expectedResult,
          status: body.status,
          priority: body.priority,
          steps: body.steps || '', // Add default value
        },
        include: { versions: true },
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
