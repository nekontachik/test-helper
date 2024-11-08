// src/app/api/projects/[projectId]/test-cases/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createTestCaseSchema } from '@/lib/validation/schemas';
import { withAuthorization } from '@/middleware/authorize';
import { withProtect } from '@/middleware/apiProtect';
import { Action, Resource } from '@/types/rbac';
import logger from '@/lib/logger';
import type { Session } from 'next-auth';
import type { TestCase, Prisma } from '@prisma/client';

interface TestCaseResponse {
  items: TestCase[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    itemsPerPage: number;
  };
}

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.string().optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
});

async function handleGET(request: Request): Promise<Response> {
  try {
    const { searchParams, pathname } = new URL(request.url);
    const projectId = pathname.split('/')[3];

    const validatedQuery = querySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      search: searchParams.get('search'),
    });

    const { page, limit, status, priority, search } = validatedQuery;
    const skip = (page - 1) * limit;

    const where: Prisma.TestCaseWhereInput = {
      deleted: false,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } }
        ]
      })
    };

    const [items, totalCount] = await Promise.all([
      prisma.testCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.testCase.count({ where })
    ]);

    logger.info('Retrieved test cases', {
      projectId,
      userId: (request as any).session?.user.id,
      page,
      limit,
      totalCount,
    });

    return NextResponse.json({
      items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    logger.error('Error retrieving test cases:', error);
    return handleApiError(error);
  }
}

async function handlePOST(request: Request): Promise<Response> {
  try {
    const { pathname } = new URL(request.url);
    const projectId = pathname.split('/')[3];
    const body = await request.json();
    const data = createTestCaseSchema.parse(body);
    const userId = (request as any).session?.user.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const testCase = await prisma.testCase.create({
      data: {
        title: data.title,
        description: data.description || '',
        steps: data.steps,
        expectedResult: data.expectedResult,
        status: data.status,
        priority: data.priority,
        deleted: false,
        userId,
        projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    logger.info('Created test case', {
      testCaseId: testCase.id,
      projectId,
      userId,
      title: testCase.title
    });

    return NextResponse.json(testCase, { status: 201 });
  } catch (error) {
    logger.error('Error creating test case:', error);
    return handleApiError(error);
  }
}

function handleApiError(error: unknown): Response {
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

export const GET = withProtect(
  withAuthorization(handleGET, {
    action: Action.READ,
    resource: Resource.TEST_CASE,
    allowTeamMembers: true,
    getProjectId: async (req: Request) => {
      const url = new URL(req.url);
      const parts = url.pathname.split('/');
      return parts[3];
    },
  }),
  {
    action: Action.READ,
    resource: Resource.TEST_CASE,
    allowUnverified: false,
    rateLimit: {
      points: 100,
      duration: 60
    }
  }
);

export const POST = withProtect(
  withAuthorization(handlePOST, {
    action: Action.CREATE,
    resource: Resource.TEST_CASE,
    allowTeamMembers: true,
    getProjectId: async (req: Request) => {
      const url = new URL(req.url);
      const parts = url.pathname.split('/');
      return parts[3];
    },
  }),
  {
    action: Action.CREATE,
    resource: Resource.TEST_CASE,
    allowUnverified: false,
    rateLimit: {
      points: 50,
      duration: 60
    }
  }
);