import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProjectApiError } from '../utils/errorHandler';
import type { Session } from 'next-auth';

/**
 * Handler for retrieving a project by ID
 */
export async function getProject(
  req: Request,
  { params, session }: { params: { id: string }; session: Session }
): Promise<NextResponse> {
  const { id } = params;
  // Session is unused but required by the protect middleware
  const _session = session;

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
    throw new ProjectApiError('Project not found', 404, 'NOT_FOUND');
  }

  return NextResponse.json(project);
} 