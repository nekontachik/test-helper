import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { testSuiteSchema } from '@/lib/validation';

async function handler(req: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [testSuites, totalCount] = await prisma.$transaction([
      prisma.testSuite.findMany({
        where: { projectId },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          testCases: {
            select: {
              id: true,
              title: true,
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.testSuite.count({
        where: { projectId }
      })
    ]);

    const response = NextResponse.json({
      items: testSuites,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
        limit
      }
    });

    response.headers.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=59');
    
    return response;
  }

  if (req.method === 'POST') {
    try {
      const data = await req.json();
      const validated = testSuiteSchema.parse(data);

      const testSuite = await prisma.testSuite.create({
        data: {
          ...validated,
          projectId,
          testCases: {
            connect: validated.testCaseIds?.map(id => ({ id })) || [],
          },
        },
        include: {
          testCases: true,
        },
      });

      return NextResponse.json(testSuite, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid test suite data' },
        { status: 400 }
      );
    }
  }

  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}

export const GET = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER]
});

export const POST = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER]
});
