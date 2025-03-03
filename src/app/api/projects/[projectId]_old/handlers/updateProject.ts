import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProjectApiError } from '../utils/errorHandler';
import { updateProjectSchema } from '../schemas';
import type { Session } from 'next-auth';

/**
 * Handler for updating a project by ID
 */
export async function updateProject(
  req: Request,
  { params, session }: { params: { id: string }; session: Session }
): Promise<NextResponse> {
  const { id } = params;
  // Session is unused but required by the protect middleware
  const _session = session;
  
  const body = await req.json();
  
  // Validate request body
  const validatedData = updateProjectSchema.parse(body);
  
  // Check if project exists
  const existingProject = await prisma.project.findUnique({
    where: { id }
  });
  
  if (!existingProject) {
    throw new ProjectApiError('Project not found', 404, 'NOT_FOUND');
  }
  
  // Create a properly typed data object for Prisma
  const data = {
    ...(validatedData.name !== undefined && { name: validatedData.name }),
    ...(validatedData.description !== undefined && { description: validatedData.description }),
    ...(validatedData.status !== undefined && { status: validatedData.status })
  };
  
  // Update project
  const updatedProject = await prisma.project.update({
    where: { id },
    data
  });
  
  return NextResponse.json(updatedProject);
} 