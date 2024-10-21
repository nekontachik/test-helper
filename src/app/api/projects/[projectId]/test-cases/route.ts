import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { TestCaseStatus, TestCasePriority } from '@/types';
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
    const status = searchParams.get('status') as TestCaseStatus | null;
    const priority = searchParams.get('priority') as TestCasePriority | null;
    const search = searchParams.get('search') || '';

    const where = {
      projectId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [testCases, totalCount] = await Promise.all([
      prisma.testCase.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.testCase.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    logger.info(`Retrieved test cases for project ${projectId}`, { page, limit, totalCount });

    return NextResponse.json({
      items: testCases,
      currentPage: page,
      totalPages,
      totalCount,
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test cases: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in GET test cases:', error);
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

    if (!body.title || !body.description) {
      throw new ValidationError('Title and description are required');
    }

    const newTestCase = await prisma.testCase.create({
      data: {
        ...body,
        projectId,
      },
    });

    logger.info(`Created new test case for project ${projectId}`, { testCaseId: newTestCase.id });
    return NextResponse.json(newTestCase, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in POST test case: ${error.message}`, { statusCode: error.statusCode });
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Unexpected error in POST test case:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string; testCaseId: string } }
) {
  const { projectId, testCaseId } = params;
  const body = await request.json();

  try {
    const updatedTestCase = await prisma.testCase.update({
      where: { id: testCaseId },
      data: body,
    });

    return NextResponse.json(updatedTestCase);
  } catch (error) {
    console.error('Error updating test case:', error);
    return NextResponse.json({ error: 'Failed to update test case' }, { status: 500 });
  }
}
