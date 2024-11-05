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
import type { TestCase, Prisma } from '@prisma/client';

// Validation schemas
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'priority']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

const paramsSchema = z.object({
  projectId: z.string().uuid(),
});

// Response types
interface TestCaseResponse {
  items: TestCase[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    itemsPerPage: number;
  };
  filters?: {
    status?: string;
    priority?: string;
    search?: string;
  };
}

/**
 * GET handler for retrieving test cases
 */
async function handleGET(request: Request): Promise<Response> {
  try {
    // Parse and validate query parameters
    const { searchParams, pathname } = new URL(request.url);
    const projectId = pathname.split('/')[3];

    // Validate project ID
    await paramsSchema.parseAsync({ projectId });

    const validatedQuery = querySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
      order: searchParams.get('order'),
    });

    const { page, limit, status, priority, search, sortBy, order } = validatedQuery;
    const skip = (page - 1) * limit;

    // Build query filters
    const where: Prisma.TestCaseWhereInput = {
      projectId,
      deleted: false,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { title: { contains: search.toLowerCase() } },
          { description: { contains: search.toLowerCase() } }
        ]
      })
    };

    // Execute queries in parallel
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

    // Log successful retrieval
    logger.info('Retrieved test cases', {
      projectId,
      page,
      limit,
      totalCount,
      filters: { status, priority, search },
    });

    // Return formatted response
    return NextResponse.json({
      items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        itemsPerPage: limit
      },
      filters: {
        status,
        priority,
        search,
      }
    });
  } catch (error) {
    logger.error('Error retrieving test cases:', error);
    return handleApiError(error);
  }
}

/**
 * POST handler for creating test cases
 */
async function handlePOST(request: Request): Promise<Response> {
  try {
    // Parse and validate request data
    const { pathname } = new URL(request.url);
    const projectId = pathname.split('/')[3];

    // Validate project ID
    await paramsSchema.parseAsync({ projectId });

    const body = await request.json();
    const data = createTestCaseSchema.parse(body);

    // Get user from session
    const session = (request as any).session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        status: true,
        members: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot create test cases in inactive project' },
        { status: 403 }
      );
    }

    // Create test case with proper typing
    const testCase = await prisma.testCase.create({
      data: {
        title: data.title,
        description: data.description || '',  // Ensure description is never undefined
        steps: data.steps,
        expectedResult: data.expectedResult,
        status: data.status,
        priority: data.priority,
        projectId,
        userId: session.user.id,  // Changed from authorId to userId to match schema
        deleted: false,
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

    // Log successful creation
    logger.info('Created test case', {
      testCaseId: testCase.id,
      projectId,
      userId: session.user.id,
      title: testCase.title
    });

    return NextResponse.json(testCase, { status: 201 });
  } catch (error) {
    logger.error('Error creating test case:', error);
    return handleApiError(error);
  }
}

// Export protected route handlers
export const GET = withProtect(
  withAuthorization(handleGET, {
    action: ActionType.READ,
    resource: ResourceType.TEST_CASE,
    allowTeamMembers: true,
    getProjectId: async (req: Request) => {
      const url = new URL(req.url);
      const parts = url.pathname.split('/');
      return parts[3];
    },
  }),
  {
    action: ActionType.READ,
    resource: ResourceType.TEST_CASE,
    allowUnverified: false,
    rateLimit: {
      points: 100,
      duration: 60
    }
  }
);

export const POST = withProtect(
  withAuthorization(handlePOST, {
    action: ActionType.CREATE,
    resource: ResourceType.TEST_CASE,
    allowTeamMembers: true,
    getProjectId: async (req: Request) => {
      const url = new URL(req.url);
      const parts = url.pathname.split('/');
      return parts[3];
    },
  }),
  {
    action: ActionType.CREATE,
    resource: ResourceType.TEST_CASE,
    allowUnverified: false,
    rateLimit: {
      points: 50,
      duration: 60
    }
  }
);