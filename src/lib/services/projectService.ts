import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BaseError } from '@/lib/errors/BaseError';
import type { Project, TestCase, TestRun, Prisma } from '@prisma/client';

interface ProjectData {
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
}

interface ProjectWithRelations extends Project {
  testCases: TestCase[];
  testRuns: TestRun[];
}

/**
 * Get a project by ID
 */
export async function getProject(projectId: string): Promise<ProjectWithRelations> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      testCases: {
        where: { deleted: false },
        orderBy: { updatedAt: 'desc' }
      },
      testRuns: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!project) {
    throw new BaseError('Project not found', {
      code: 'NOT_FOUND',
      status: 404
    });
  }

  return project;
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, data: ProjectData): Promise<Project> {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new BaseError('Unauthorized', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }
  
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });
  
  if (!project) {
    throw new BaseError('Project not found', {
      code: 'NOT_FOUND',
      status: 404
    });
  }
  
  if (project.userId !== session.user.id) {
    throw new BaseError('Forbidden', {
      code: 'FORBIDDEN',
      status: 403
    });
  }
  
  // Create a properly typed update object for Prisma
  const updateData: Prisma.ProjectUpdateInput = {
    name: data.name,
    updatedAt: new Date()
  };
  
  // Only add optional fields if they are defined
  if (data.description !== undefined) {
    updateData.description = data.description || null;
  }
  
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  
  return prisma.project.update({
    where: { id: projectId },
    data: updateData
  });
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new BaseError('Unauthorized', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }
  
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });
  
  if (!project) {
    throw new BaseError('Project not found', {
      code: 'NOT_FOUND',
      status: 404
    });
  }
  
  if (project.userId !== session.user.id) {
    throw new BaseError('Forbidden', {
      code: 'FORBIDDEN',
      status: 403
    });
  }
  
  await prisma.$transaction([
    // Delete all test cases
    prisma.testCase.deleteMany({
      where: { projectId }
    }),
    
    // Delete all test runs
    prisma.testRun.deleteMany({
      where: { projectId }
    }),
    
    // Delete the project
    prisma.project.delete({
      where: { id: projectId }
    })
  ]);
}

/**
 * Create a new project
 */
export async function createProject(data: ProjectData): Promise<Project> {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new BaseError('Unauthorized', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }
  
  // Create a properly typed create object for Prisma
  const createData: Prisma.ProjectCreateInput = {
    name: data.name,
    status: data.status || 'ACTIVE',
    user: {
      connect: { id: session.user.id }
    }
  };
  
  // Only add description if it's defined
  if (data.description !== undefined) {
    createData.description = data.description || null;
  }
  
  return prisma.project.create({
    data: createData
  });
} 