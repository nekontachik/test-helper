import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/utils/logger';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId } = params;

    const project = await prisma.project.findUnique({
      where: { 
        id: projectId,
        userId: session.user.id 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return NextResponse.json(project);
  } catch (error) {
    logger.error('Error in GET project:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message }, 
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { projectId } = params;

    const project = await prisma.project.findUnique({
      where: { 
        id: projectId,
        userId: session.user.id 
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Error in DELETE project:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message }, 
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
