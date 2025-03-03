import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { protect } from '@/lib/auth/protect';
import { logger } from '@/lib/logger';
import { ApiError } from '@/lib/api/errorHandler';

// Validation schemas
const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
});

async function getProject(
  req: NextRequest,
  { params, session }: { params: { id: string }; session: any }
) {
  const { id } = params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      testRuns: {
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: {
        select: {
          testRuns: true,
          testCases: true
        }
      }
    }
  });

  if (!project) {
    throw new ApiError('Project not found', 404, 'NOT_FOUND');
  }

  return NextResponse.json(project);
}

async function updateProject(
  req: NextRequest,
  { params, session }: { params: { id: string }; session: any }
) {
  const { id } = params;
  const body = await req.json();
  
  // Validate request body
  const data = updateProjectSchema.parse(body);
  
  // Check if project exists
  const existingProject = await prisma.project.findUnique({
    where: { id }
  });
  
  if (!existingProject) {
    throw new ApiError('Project not found', 404, 'NOT_FOUND');
  }
  
  // Update project
  const updatedProject = await prisma.project.update({
    where: { id },
    data
  });
  
  return NextResponse.json(updatedProject);
}

async function deleteProject(
  req: NextRequest,
  { params, session }: { params: { id: string }; session: any }
) {
  const { id } = params;
  
  // Check if project exists
  const existingProject = await prisma.project.findUnique({
    where: { id }
  });
  
  if (!existingProject) {
    throw new ApiError('Project not found', 404, 'NOT_FOUND');
  }
  
  // Soft delete by updating status
  await prisma.project.update({
    where: { id },
    data: { status: 'ARCHIVED' }
  });
  
  return NextResponse.json({ success: true });
}

export const GET = protect(getProject, {
  roles: ['ADMIN', 'MANAGER', 'EDITOR', 'TESTER'],
  audit: true,
  auditAction: 'PROJECT_VIEW'
});

export const PUT = protect(updateProject, {
  roles: ['ADMIN', 'MANAGER', 'EDITOR'],
  requireVerified: true,
  audit: true,
  auditAction: 'PROJECT_UPDATE'
});

export const DELETE = protect(deleteProject, {
  roles: ['ADMIN', 'MANAGER'],
  requireVerified: true,
  rateLimit: { points: 10, duration: 60 },
  audit: true,
  auditAction: 'PROJECT_DELETE'
}); 