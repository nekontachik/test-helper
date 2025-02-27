import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { testSuiteSchema } from '@/lib/validation';
import type { Session } from 'next-auth';

async function handler(req: Request, context: { params: { projectId: string }, session: Session }): Promise<Response> {
  const { projectId } = context.params;

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
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
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
            connect: validated.testCaseIds?.map(id => ({ id })) || []
          }
        },
        include: {
          testCases: true
        }
      });

      return NextResponse.json(testSuite, { status: 201 });
    } catch {
      // Using NextResponse to ensure we return a proper Response
      return NextResponse.json(
        { message: 'Invalid test suite data', code: 'ERROR_CODE', status: 400 },
        { status: 400 }
      );
    }
  }

  // Using NextResponse to ensure we return a proper Response
  return NextResponse.json(
    { message: 'Method not allowed', code: 'ERROR_CODE', status: 405 },
    { status: 405 }
  );
}

// Modify the handler to match the expected signature
const apiHandler = (req: Request, session: Session): Promise<Response> => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const projectId = pathParts[pathParts.indexOf('projects') + 1];
  
  return handler(req, { params: { projectId }, session });
};

export const GET = withAuth(apiHandler, {
  allowedRoles: ['ADMIN', 'PROJECT_MANAGER', 'TESTER']
});

export const POST = withAuth(apiHandler, {
  allowedRoles: ['ADMIN', 'PROJECT_MANAGER']
});
