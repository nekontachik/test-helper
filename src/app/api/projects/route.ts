import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSuccessResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withSimpleAuth } from '@/lib/auth/withSimpleAuth';
import { MOCK_USER } from '@/lib/auth/simpleAuth';
import { logger } from '@/lib/logger';
import type { Project } from '@/types';
import { createRouteHandler, successResponse } from '../[...route]/route';
import { withAuth } from '../[...route]/middleware';
import { authUtils } from '@/lib/utils/authUtils';
import type { Prisma } from '@prisma/client';
import { withRateLimit } from '../[...route]/rateLimiter';
import { withValidation } from '../[...route]/validator';
import { protect } from '@/lib/auth/protect';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional()
});

// Mock data for development/testing
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform Testing',
    description: 'Comprehensive testing for the e-commerce platform including checkout, product listings, and user accounts',
    status: 'ACTIVE',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-02-20'),
    userId: 'user-123'
  },
  {
    id: '2',
    name: 'Mobile App Testing',
    description: 'Testing of mobile application across Android and iOS platforms',
    status: 'ACTIVE',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-25'),
    userId: 'user-123'
  },
  {
    id: '3',
    name: 'API Integration Tests',
    description: 'Testing of third-party API integrations and data validation',
    status: 'COMPLETED',
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2023-04-10'),
    userId: 'user-123'
  }
];

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        ...data,
        userId: MOCK_USER.id
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    logger.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

async function handleGET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.count()
    ]);

    const response = createSuccessResponse({
      items: projects,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export const POST = withSimpleAuth(handlePOST);
export const GET = protect(handleGET, {
  roles: ['ADMIN', 'MANAGER', 'EDITOR', 'TESTER'],
  requireVerified: true,
  rateLimit: { points: 100, duration: 60 },
  audit: true
});

export async function GETMock(request: Request): Promise<NextResponse> {
  try {
    // Get the URL from the request
    const url = new URL(request.url);
    
    // Parse pagination parameters
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // Calculate pagination values
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = mockProjects.length;
    
    // Get paginated data
    const data = mockProjects.slice(startIndex, endIndex);
    
    // Return response with pagination metadata
    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { message: 'Failed to fetch projects', code: 'PROJECTS_FETCH_ERROR' },
      { status: 500 }
    );
  }
}

export async function POSTMock(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { message: 'Project name is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    
    // Create new project (in a real app, this would save to a database)
    const newProject: Project = {
      id: `${mockProjects.length + 1}`,
      name: body.name,
      description: body.description || null,
      status: body.status || 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-123' // In a real app, this would come from the authenticated user
    };
    
    // Add to mock projects (in memory)
    mockProjects.push(newProject);
    
    return NextResponse.json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { message: 'Failed to create project', code: 'PROJECT_CREATE_ERROR' },
      { status: 500 }
    );
  }
}

// Input validation schemas
const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).default('ACTIVE')
});

const querySchema = z.object({
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20)
});

const idParamSchema = z.object({
  id: z.string().uuid()
});

// List projects - accessible by all authenticated users
const handleGetProjects = withAuth(
  withRateLimit(
    withValidation(
      async (req, { query }) => {
        const where: Prisma.ProjectWhereInput = {
          ...(query?.status && { status: query.status }),
          ...(query?.search && {
            OR: [
              { name: { contains: query.search } },
              { description: { contains: query.search } }
            ]
          })
        };

        const [projects, total] = await Promise.all([
          prisma.project.findMany({
            where,
            skip: ((query?.page || 1) - 1) * (query?.limit || 20),
            take: query?.limit || 20,
            orderBy: { updatedAt: 'desc' },
            include: {
              _count: {
                select: {
                  testCases: true,
                  testRuns: true
                }
              }
            }
          }),
          prisma.project.count({ where })
        ]);

        return successResponse({
          items: projects,
          total,
          page: query?.page || 1,
          limit: query?.limit || 20,
          pages: Math.ceil(total / (query?.limit || 20))
        });
      },
      { query: querySchema }
    ),
    { max: 100, windowMs: 60 * 1000 } // 100 requests per minute
  )
);

// Create project - only accessible by ADMIN and PROJECT_MANAGER
const handleCreateProject = withAuth(
  withRateLimit(
    withValidation(
      async (req, { body }) => {
        const session = await authUtils.getSession();
        if (!session?.user) {
          throw new Error('Unauthorized');
        }

        const createData: Prisma.ProjectCreateInput = {
          ...body!,
          user: { connect: { id: session.user.id } }
        };

        const project = await prisma.project.create({
          data: createData,
          include: {
            _count: {
              select: {
                testCases: true,
                testRuns: true
              }
            }
          }
        });

        return successResponse(project, 201);
      },
      { body: projectSchema }
    ),
    { max: 20, windowMs: 60 * 1000 } // 20 creates per minute
  ),
  { requiredRoles: ['ADMIN', 'PROJECT_MANAGER'] }
);

// Update project - only accessible by ADMIN and PROJECT_MANAGER
const handleUpdateProject = withAuth(
  withRateLimit(
    withValidation(
      async (req, { body, params }) => {
        const updateData: Prisma.ProjectUpdateInput = {
          ...body!,
          updatedAt: new Date()
        };

        const project = await prisma.project.update({
          where: { id: params!.id },
          data: updateData,
          include: {
            _count: {
              select: {
                testCases: true,
                testRuns: true
              }
            }
          }
        });

        return successResponse(project);
      },
      {
        body: projectSchema,
        params: idParamSchema
      }
    ),
    { max: 50, windowMs: 60 * 1000 } // 50 updates per minute
  ),
  { requiredRoles: ['ADMIN', 'PROJECT_MANAGER'] }
);

// Delete project - only accessible by ADMIN
const handleDeleteProject = withAuth(
  withRateLimit(
    withValidation(
      async (req, { params }) => {
        await prisma.project.update({
          where: { id: params!.id },
          data: { status: 'ARCHIVED' }
        });

        return successResponse({ success: true });
      },
      { params: idParamSchema }
    ),
    { max: 10, windowMs: 60 * 1000 } // 10 deletes per minute
  ),
  { requiredRoles: ['ADMIN'] }
);

// Export route handlers
const routeHandlers = {
  GET: handleGetProjects,
  POST: handleCreateProject,
  PUT: handleUpdateProject,
  DELETE: handleDeleteProject
};

type RouteHandlers = {
  GET: typeof handleGetProjects;
  POST: typeof handleCreateProject;
  PUT: typeof handleUpdateProject;
  DELETE: typeof handleDeleteProject;
};

const wrappedHandlers = Object.fromEntries(
  Object.entries(routeHandlers).map(([method, handler]) => [
    method,
    createRouteHandler({ [method]: handler })
  ])
) as RouteHandlers;

export const {
  GET,
  POST,
  PUT,
  DELETE
} = wrappedHandlers;
