import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TestCaseStatus, TestCasePriority, TestCaseFormData } from '@/types';
import { validateTestCase } from '@/lib/validationSchemas';
import { TestCase } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { AppError, NotFoundError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const sort = url.searchParams.get('sort') || 'title_asc';
  const filter = url.searchParams.get('filter') || '';

  const skip = (page - 1) * limit;

  const [sortField, sortOrder] = sort.split('_');

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError('Unauthorized', 401);
    }

    const allTestCases = await prisma.testCase.findMany({
      where: {
        projectId: params.projectId,
      },
    });

    const filteredTestCases = allTestCases.filter((testCase) =>
      testCase.title.toLowerCase().includes(filter.toLowerCase())
    );

    const sortedTestCases = filteredTestCases.sort((a, b) => {
      if (sortField === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });

    const totalCount = sortedTestCases.length;
    const paginatedTestCases = sortedTestCases.slice(skip, skip + limit);

    return NextResponse.json({
      data: paginatedTestCases,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn(`AppError in GET test cases: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    logger.error('Failed to fetch test cases:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  const body = await req.json();

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const validationResult = await validateTestCase(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.errors },
        { status: 400 }
      );
    }

    const testCaseData = {
      ...body,
      projectId,
      userId: session.user.id,
      priority: body.priority || TestCasePriority.MEDIUM,
      status: body.status || TestCaseStatus.ACTIVE,
    };

    const testCase = await prisma.testCase.create({
      data: testCaseData,
    });
    return NextResponse.json(testCase, { status: 201 });
  } catch (error) {
    console.error('Error creating test case:', error);
    return NextResponse.json(
      { error: 'Failed to create test case' },
      { status: 400 }
    );
  }
}
