import { type NextRequest } from 'next/server';
import { type ApiResponse } from '@/types/api';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { createEndpoint } from '@/lib/api/createEndpoint';

// Validation schemas
const _querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'priority']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc')
});

const _paramsSchema = z.object({
  projectId: z.string().uuid()
});

// Export protected route handlers
export async function GET(_req: NextRequest, { params }: { params: { projectId: string } }): Promise<ApiResponse<unknown>> {
  return {
    success: true,
    data: await prisma.testCase.findMany({
      where: {
        projectId: params.projectId,
        deleted: false
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }),
    status: 200
  };
}

// Define the schema for test case creation
const testCaseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  steps: z.string(),
  expectedResult: z.string(),
  status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED']).default('DRAFT'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  projectId: z.string().uuid()
});

// Define the type for the schema
type TestCaseInput = z.infer<typeof testCaseSchema>;

export const POST = createEndpoint({
  method: 'POST',
  schema: testCaseSchema,
  handler: async (data: TestCaseInput) => {
    // Get user from session (this would be handled by middleware in a real app)
    const session = { user: { id: 'user-id' } }; // Placeholder

    if (!session?.user?.id) {
      return {
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED'
        },
        status: 401
      };
    }

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { 
        id: true, 
        status: true,
        members: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!project) {
      return {
        success: false,
        error: {
          message: 'Project not found',
          code: 'NOT_FOUND'
        },
        status: 404
      };
    }

    if (project.status !== 'ACTIVE') {
      return {
        success: false,
        error: {
          message: 'Cannot create test cases in inactive project',
          code: 'FORBIDDEN'
        },
        status: 403
      };
    }

    // Create test case
    const testCase = await prisma.testCase.create({
      data: {
        title: data.title,
        description: data.description || '',
        steps: data.steps,
        expectedResult: data.expectedResult,
        status: data.status,
        priority: data.priority,
        projectId: data.projectId,
        userId: session.user.id,
        deleted: false
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
      projectId: data.projectId,
      userId: session.user.id,
      title: testCase.title
    });

    return {
      success: true,
      data: testCase,
      status: 201
    };
  }
});