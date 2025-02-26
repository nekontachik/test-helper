import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BaseError } from '@/lib/errors/BaseError';
import type { Project, TestCase, TestRun } from '@prisma/client';

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
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new BaseError('Not authenticated', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }

  const project = await prisma.project.findUnique({
    where: { 
      id: projectId,
      userId: session.user.id 
    },
    include: {
      testCases: true,
      testRuns: true,
    },
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
  if (!session?.user) {
    throw new BaseError('Not authenticated', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }

  // Verify project exists and belongs to user
  const existingProject = await prisma.project.findUnique({
    where: { 
      id: projectId,
      userId: session.user.id 
    },
  });

  if (!existingProject) {
    throw new BaseError('Project not found', {
      code: 'NOT_FOUND',
      status: 404
    });
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      updatedAt: new Date(),
    },
  });
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new BaseError('Not authenticated', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }

  const project = await prisma.project.findUnique({
    where: { 
      id: projectId,
      userId: session.user.id 
    },
  });

  if (!project) {
    throw new BaseError('Project not found', {
      code: 'NOT_FOUND',
      status: 404
    });
  }

  // Use transaction to delete related records
  await prisma.$transaction([
    // Delete test results
    prisma.testResult.deleteMany({
      where: { testCase: { projectId } },
    }),
    // Delete test cases
    prisma.testCase.deleteMany({
      where: { projectId },
    }),
    // Delete test runs
    prisma.testRun.deleteMany({
      where: { projectId },
    }),
    // Finally delete the project
    prisma.project.delete({
      where: { id: projectId },
    }),
  ]);
}

/**
 * Create a new project
 */
export async function createProject(data: ProjectData): Promise<Project> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new BaseError('Not authenticated', {
      code: 'UNAUTHORIZED',
      status: 401
    });
  }

  // Check if user has reached project limit
  const projectCount = await prisma.project.count({
    where: { userId: session.user.id },
  });

  if (projectCount >= 50) {
    throw new BaseError('Project limit reached', {
      code: 'VALIDATION_ERROR',
      status: 409,
      details: { limit: 50 }
    });
  }

  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      status: data.status || 'ACTIVE',
      userId: session.user.id,
    },
  });
} 