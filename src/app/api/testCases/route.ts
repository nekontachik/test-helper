// src/app/api/projects/[projectId]/test-cases/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createTestCaseSchema } from '@/lib/validation/schemas';
import { handleApiError } from '@/lib/apiErrorHandler';
import { withAuthorization } from '@/middleware/authorize';
import { withProtect } from '@/middleware/apiProtect';
import { ActionType, ResourceType } from '@/types/rbac';
import logger from '@/lib/logger';
import type { NextRequest } from 'next/server';
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

async function handleGET(
  request: NextRequest & { session?: Session }
): Promise<Response> {
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
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
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
          user: {
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
      userId: request.session?.user.id,
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

async function handlePOST(
  request: NextRequest & { session?: Session }
): Promise<Response> {
  try {
    const { pathname } = new URL(request.url);
    const projectId = pathname.split('/')[3];
    const body = await request.json();
    const data = createTestCaseSchema.parse(body);

    const testCase = await prisma.testCase.create({
      data: {
        ...data,
        userId: request.session?.user.id,
        deleted: false, // Ensure this field exists in the schema
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
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
      userId: request.session?.user.id,
      title: testCase.title
    });

    return NextResponse.json(testCase, { status: 201 });
  } catch (error) {
    logger.error('Error creating test case:', error);
    return handleApiError(error);
  }
}

export const GET = withProtect(
  withAuthorization(handleGET, {
    action: ActionType.READ,
    resource: ResourceType.TEST_CASE,
    allowTeamMembers: true,
    getProjectId: async (req: NextRequest) => {
      const url = new URL(req.url);
      const parts = url.pathname.split('/');
      return parts[3];
    },
  }),
  {
    action: ActionType.READ,
    resource: ResourceType.TEST_CASE,
    allowUnverified: false, // Updated based on previous config
    rateLimit: {
      points: 100,
      duration: 60 // 100 requests per minute
    }
  }
);

export const POST = withProtect(
  withAuthorization(handlePOST, {
    action: ActionType.CREATE,
    resource: ResourceType.TEST_CASE,
    allowTeamMembers: true,
    getProjectId: async (req: NextRequest) => {
      const url = new URL(req.url);
      const parts = url.pathname.split('/');
      return parts[3];
    },
  }),
  {
    action: ActionType.CREATE,
    resource: ResourceType.TEST_CASE,
    allowUnverified: false, // Updated based on previous config
    rateLimit: {
      points: 50,
      duration: 60 // 50 requests per minute
    }
  }
);