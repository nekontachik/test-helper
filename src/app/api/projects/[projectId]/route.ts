import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { Session } from 'next-auth';

interface AuthenticatedSession extends Session {
  user: {
    id: string;
    email: string;
    role: string;
  } & Session['user'];
}

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions) as AuthenticatedSession | null;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { 
        id: params.projectId,
        userId: session.user.id
      },
      include: { testCases: true }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions) as AuthenticatedSession | null;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description } = await req.json();
    const updatedProject = await prisma.project.update({
      where: { 
        id: params.projectId,
        userId: session.user.id
      },
      data: {
        name,
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions) as AuthenticatedSession | null;

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.project.delete({
      where: { 
        id: params.projectId,
        userId: session.user.id
      },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
