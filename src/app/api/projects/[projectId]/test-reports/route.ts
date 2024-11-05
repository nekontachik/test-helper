import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/apiErrorHandler';
import { withAuthorization } from '@/middleware/authorize';
import { withProtect } from '@/middleware/apiProtect';
import { ActionType, ResourceType } from '@/types/rbac';
import logger from '@/lib/logger';
import type { TestReport, Prisma } from '@prisma/client';

// Validation schemas - Move outside handler for better performance
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
}).transform(data => ({
  ...data,
  // Pre-transform search term for case-insensitive search
  search: data.search?.toLowerCase(),
}));

const paramsSchema = z.object({
  projectId: z.string().uuid(),
});

const createSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  content: z.string().min(1).trim(),
  attachments: z.array(z.string().url()).optional(),
});

// Response types
interface TestReportResponse {
  items: TestReport[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    itemsPerPage: number;
  };
  filters?: {
    search?: string;
    sortBy?: string;
    order?: string;
  };
}

// Reusable select objects for better performance and maintainability
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

const projectSelect = {
  id: true,
  name: true,
  status: true,
} as const;

/**
 * GET handler for retrieving test reports
 */
async function handleGET(request: Request): Promise<Response> {
  try {
    const { searchParams, pathname } = new URL(request.url);
    const projectId = pathname.split('/')[3];

    // Validate project ID
    await paramsSchema.parseAsync({ projectId });

    // Parse and validate query parameters
    const { page, limit, sortBy, order, search } = await querySchema.parseAsync({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      order: searchParams.get('order'),
      search: searchParams.get('search'),
    });

    const skip = (page - 1) * limit;

    // Build query filters
    const where: Prisma.TestReportWhereInput = {
      projectId,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
        ],
      }),
    };

    // Execute queries in parallel with transaction for consistency
    const [items, totalCount] = await prisma.$transaction([
      prisma.testReport.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
        include: {
          user: { select: userSelect },
          project: { select: projectSelect }
        }
      }),
      prisma.testReport.count({ where })
    ]);

    // Log successful retrieval
    logger.info('Retrieved test reports', {
      projectId,
      page,
      limit,
      totalCount,
      filters: { search, sortBy, order },
    });

    // Return formatted response
    return NextResponse.json({
      items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        itemsPerPage: limit,
      },
      filters: {
        search,
        sortBy,
        order,
      }
    });
  } catch (error) {
    logger.error('Error retrieving test reports:', error);
    return handleApiError(error);
  }
}

/**
 * POST handler for creating test reports
 */
async function handlePOST(request: Request): Promise<Response> {
  try {
    const { pathname } = new URL(request.url);
    const projectId = pathname.split('/')[3];

    // Validate project ID
    await paramsSchema.parseAsync({ projectId });

    const body = await request.json();
    const data = await createSchema.parseAsync(body);

    // Get user from session
    const session = (request as any).session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if project exists and user has access - use transaction for consistency
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
        { error: 'Cannot create reports in inactive project' },
        { status: 403 }
      );
    }

    // Create test report using transaction for consistency
    const testReport = await prisma.$transaction(async (tx) => {
      const report = await tx.testReport.create({
        data: {
          title: data.title,
          content: data.content,
          projectId,
          userId: session.user.id,
        },
        include: {
          user: { select: userSelect },
          project: { select: projectSelect }
        }
      });

      // Create attachments if provided
      if (data.attachments?.length) {
        // Handle attachments creation here
      }

      return report;
    });

    // Log successful creation
    logger.info('Created test report', {
      reportId: testReport.id,
      projectId,
      userId: session.user.id,
      title: testReport.title,
    });

    return NextResponse.json(testReport, { status: 201 });
  } catch (error) {
    logger.error('Error creating test report:', error);
    return handleApiError(error);
  }
}

// Export protected route handlers
export const GET = withProtect(
  withAuthorization(handleGET, {
    action: ActionType.READ,
    resource: ResourceType.REPORT,
    allowTeamMembers: true,
    getProjectId: async (req: Request) => {
      const url = new URL(req.url);
      const parts = url.pathname.split('/');
      return parts[3];
    },
  }),
  {
    action: ActionType.READ,
    resource: ResourceType.REPORT,
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
    resource: ResourceType.REPORT,
    allowTeamMembers: true,
    getProjectId: async (req: Request) => {
      const url = new URL(req.url);
      const parts = url.pathname.split('/');
      return parts[3];
    },
  }),
  {
    action: ActionType.CREATE,
    resource: ResourceType.REPORT,
    allowUnverified: false,
    rateLimit: {
      points: 50,
      duration: 60
    }
  }
);
