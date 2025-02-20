import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/errors/errorHandler';
import { AuthenticationError, NotFoundError } from '@/lib/errors/specific';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AuthenticationError('Not authenticated');
    }

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      include: {
        testCases: true,
        testRuns: true,
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return NextResponse.json(project);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { projectId } = params;

    const project = await prisma.project.findUnique({
      where: { 
        id: projectId,
        userId: session.user.id 
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    return handleApiError(error);
  }
}
