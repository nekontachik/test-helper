import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSuccessResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withSimpleAuth } from '@/lib/auth/withSimpleAuth';
import { MOCK_USER } from '@/lib/auth/simpleAuth';
import { logger } from '@/lib/utils/logger';
import type { Project } from '@/types';

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
export const GET = withSimpleAuth(handleGET);

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
