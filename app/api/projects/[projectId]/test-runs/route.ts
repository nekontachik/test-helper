import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TestRun } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const sort = url.searchParams.get('sort') || 'name_asc';
  const filter = url.searchParams.get('filter') || '';

  const skip = (page - 1) * limit;

  const [sortField, sortOrder] = sort.split('_');

  try {
    const allTestRuns = await prisma.testRun.findMany({
      where: {
        projectId: params.projectId,
      },
    });

    const filteredTestRuns = allTestRuns.filter((testRun: TestRun) =>
      testRun.name.toLowerCase().includes(filter.toLowerCase())
    );

    const sortedTestRuns = filteredTestRuns.sort((a: TestRun, b: TestRun) => {
      if (sortField === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      // Add more sorting options if needed
      return 0;
    });

    const totalCount = sortedTestRuns.length;
    const paginatedTestRuns = sortedTestRuns.slice(skip, skip + limit);

    return NextResponse.json({
      data: paginatedTestRuns,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Failed to fetch test runs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test runs' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { name } = await request.json();
    const testRun = await prisma.testRun.create({
      data: {
        name,
        projectId: params.projectId,
        status: 'PENDING',
      },
    });
    return NextResponse.json(testRun, { status: 201 });
  } catch (error) {
    console.error('Failed to create test run:', error);
    return NextResponse.json(
      { error: 'Failed to create test run' },
      { status: 500 }
    );
  }
}
