import { createRouteHandler, successResponse } from '../[...route]/route';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authUtils } from '@/lib/utils/authUtils';
import type { Prisma } from '@prisma/client';

// Input validation schemas
const testCaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  steps: z.array(z.string()).max(50),
  expectedResult: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  projectId: z.string().uuid()
});

const querySchema = z.object({
  projectId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20)
});

export const GET = createRouteHandler({
  GET: async (req) => {
    const { searchParams } = new URL(req.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));
    
    const where = {
      ...(query.projectId && { projectId: query.projectId }),
      ...(query.priority && { priority: query.priority }),
      ...(query.status && { status: query.status })
    };

    const [testCases, total] = await Promise.all([
      prisma.testCase.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.testCase.count({ where })
    ]);

    return successResponse({
      items: testCases,
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit)
    });
  }
});

export const POST = createRouteHandler({
  POST: async (req) => {
    const session = await authUtils.getSession();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const data = testCaseSchema.parse(await req.json());
    
    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { id: true }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const createData: Prisma.TestCaseCreateInput = {
      ...data,
      createdBy: { connect: { id: session.user.id } },
      updatedBy: { connect: { id: session.user.id } },
      project: { connect: { id: data.projectId } }
    };

    const testCase = await prisma.testCase.create({
      data: createData
    });

    return successResponse(testCase, 201);
  }
});

export const PUT = createRouteHandler({
  PUT: async (req) => {
    const session = await authUtils.getSession();
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      throw new Error('Test case ID is required');
    }

    const data = testCaseSchema.parse(await req.json());

    const testCase = await prisma.testCase.findUnique({
      where: { id },
      select: { id: true, projectId: true }
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    // Verify project access and match
    if (testCase.projectId !== data.projectId) {
      throw new Error('Cannot change project for existing test case');
    }

    const updateData: Prisma.TestCaseUpdateInput = {
      ...data,
      updatedBy: { connect: { id: session.user.id } },
      project: { connect: { id: data.projectId } }
    };

    const updated = await prisma.testCase.update({
      where: { id },
      data: updateData
    });

    return successResponse(updated);
  }
}); 