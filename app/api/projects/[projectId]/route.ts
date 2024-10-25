import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;
  const data = await request.json();

  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data,
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    logger.error('Error updating project:', { error, projectId, data });
    const apiError = new ApiError('Failed to update project', 500);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.statusCode }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const projectId = params.projectId;

  try {
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Error deleting project:', { error, projectId });
    const apiError = new ApiError('Failed to delete project', 500);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.statusCode }
    );
  }
}
