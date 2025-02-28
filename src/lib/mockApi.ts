// mockApi.ts
import { NextResponse } from 'next/server';
import type { Project, PaginatedResponse } from '@/types';

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

// Environment and feature flags
export const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Mock API handlers
export const mockApi = {
  getProjects(page = 1, limit = 10): PaginatedResponse<Project> {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = mockProjects.length;
    
    const data = mockProjects.slice(startIndex, endIndex);
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },
  
  getProject(id: string): Project | null {
    return mockProjects.find(project => project.id === id) || null;
  },
  
  createProject(data: { name: string; description?: string; status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' }): Project {
    const newProject: Project = {
      id: `${mockProjects.length + 1}`,
      name: data.name,
      description: data.description || null,
      status: data.status || 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-123'
    };
    
    mockProjects.push(newProject);
    return newProject;
  }
};

// Mock API route handlers
export function mockProjectsHandler(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  
  const response = mockApi.getProjects(page, limit);
  return Promise.resolve(NextResponse.json(response));
}

export function mockCreateProjectHandler(request: Request): Promise<NextResponse> {
  return request.json()
    .then(body => {
      if (!body.name) {
        return NextResponse.json(
          { message: 'Project name is required', code: 'VALIDATION_ERROR' },
          { status: 400 }
        );
      }
      
      const project = mockApi.createProject(body);
      return NextResponse.json(project);
    })
    .catch(error => {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { message: 'Failed to create project', code: 'PROJECT_CREATE_ERROR' },
        { status: 500 }
      );
    });
} 