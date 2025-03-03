import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth as _withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { testSuiteSchema } from '@/lib/validation';
import type { Session } from 'next-auth';
import { protect } from '@/lib/auth/protect';
import { UserRole } from '@/types/auth';

async function handler(req: Request, context: { params: { projectId: string }, session: Session }): Promise<NextResponse> {
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
          description: validated.description ?? null,
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

// Define a type for the handler function that's compatible with the protect function
type ApiHandler = (
  req: Request | NextRequest,
  context: { params: Record<string, string>; session: Session }
) => Promise<NextResponse>;

// Modify the handler to match the expected signature for the protect function
const apiHandler: ApiHandler = (
  req: Request | NextRequest, 
  context: { params: Record<string, string>; session: Session }
): Promise<NextResponse> => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  // Ensure projectId is always a string by providing a fallback
  const projectId = pathParts[pathParts.indexOf('projects') + 1] || '';
  
  return handler(req, { params: { projectId }, session: context.session });
};

// Disable eslint for the next line to allow the any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = protect(apiHandler as any, {
  roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TESTER]
});

// Disable eslint for the next line to allow the any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = protect(apiHandler as any, {
  roles: [UserRole.ADMIN, UserRole.MANAGER]
});
