import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { TestCaseFormData, TestCaseStatus, TestCasePriority } from '@/types';
import { AppError, ValidationError } from '@/lib/errors';
import logger from '@/lib/logger';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId } = params;
  const { searchParams } = new URL(request.url);
  
  // Parse pagination and filtering parameters
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');

  try {
    // Construct the where clause for filtering
    const where = {
      projectId,
      ...(status && { status }),
      ...(priority && { priority }),
    };

    // Fetch test cases with pagination
    const testCases = await prisma.testCase.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Get total count for pagination
    const totalTestCases = await prisma.testCase.count({ where });

    return NextResponse.json({
      items: testCases,
      totalPages: Math.ceil(totalTestCases / limit),
      currentPage: page,
    });
  } catch (error) {
    logger.error('Error fetching test cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test cases' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId } = params;
  const data: TestCaseFormData = await request.json();

  // Input validation
  if (!data.title || data.title.trim().length === 0) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!data.description || data.description.trim().length === 0) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  }
  if (!Object.values(TestCaseStatus).includes(data.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  if (!Object.values(TestCasePriority).includes(data.priority)) {
    return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
  }

  try {
    // Check if the project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create the new test case
    const newTestCase = await prisma.testCase.create({
      data: {
        ...data,
        projectId,
      },
    });

    return NextResponse.json(newTestCase, { status: 201 });
  } catch (error) {
    logger.error('Error creating test case:', error);
    return NextResponse.json(
      { error: 'Failed to create test case' },
      { status: 500 }
    );
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
    const body = await request.json();

    if (!body.title || !body.description) {
      throw new ValidationError('Title and description are required');
    }

    const updatedTestCase = await prisma.testCase.update({
      where: { id: testCaseId, projectId },
      data: body,
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
  request: NextRequest,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId, testCaseId } = params;

    await prisma.testCase.delete({
      where: { id: testCaseId, projectId },
    });

    logger.info(`Deleted test case ${testCaseId} from project ${projectId}`);
    return NextResponse.json({ message: 'Test case deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      logger.warn(`AppError in DELETE test case: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      logger.warn(`Test case not found: ${params.testCaseId}`);
      return NextResponse.json({ error: 'Test case not found' }, { status: 404 });
    }
    logger.error('Unexpected error in DELETE test case:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
