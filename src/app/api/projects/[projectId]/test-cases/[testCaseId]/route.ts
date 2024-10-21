import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { AppError, NotFoundError, ValidationError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testCaseId } = params;

    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new NotFoundError('Test case not found');
    }

    if (testCase.projectId !== projectId) {
      throw new AppError('Test case does not belong to the specified project', 400);
    }

    logger.info(`Retrieved test case: ${testCaseId}`, { projectId, testCaseId });
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

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testCaseId } = params;
    const body = await request.json();

    if (!body.title || !body.description) {
      throw new ValidationError('Title and description are required');
    }

    const existingTestCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!existingTestCase) {
      throw new NotFoundError('Test case not found');
    }

    if (existingTestCase.projectId !== projectId) {
      throw new AppError('Test case does not belong to the specified project', 400);
    }

    const updatedTestCase = await prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        ...body,
        version: { increment: 1 },
      },
    });

    await prisma.testCaseVersion.create({
      data: {
        testCaseId: updatedTestCase.id,
        versionNumber: updatedTestCase.version,
        title: updatedTestCase.title,
        description: updatedTestCase.description,
        status: updatedTestCase.status,
        priority: updatedTestCase.priority,
        expectedResult: updatedTestCase.expectedResult,
      },
    });

    logger.info(`Updated test case: ${testCaseId}`, { projectId, testCaseId });
    return NextResponse.json(updatedTestCase);
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in PUT test case: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
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
    const session = await getServerSession();
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testCaseId } = params;

    const existingTestCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!existingTestCase) {
      throw new NotFoundError('Test case not found');
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
