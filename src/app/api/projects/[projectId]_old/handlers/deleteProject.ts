import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProjectApiError } from '../utils/errorHandler';
import type { Session } from 'next-auth';

/**
 * Handler for deleting (archiving) a project by ID
 */
export async function deleteProject(
  req: Request,
  { params, session }: { params: { id: string }; session: Session }
): Promise<NextResponse> {
  const { id } = params;
  // Session is unused but required by the protect middleware
  const _session = session;
  
  // Check if project exists
  const existingProject = await prisma.project.findUnique({
    where: { id }
  });
  
  if (!existingProject) {
    throw new ProjectApiError('Project not found', 404, 'NOT_FOUND');
  }
  
  // Soft delete by updating status
  await prisma.project.update({
    where: { id },
    data: { status: 'ARCHIVED' }
  });
  
  return NextResponse.json({ success: true });
} 