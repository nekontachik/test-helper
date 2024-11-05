import { NextResponse } from 'next/server';
import { permissionGuard } from '@/middleware/permissionGuard';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Check permissions
  const permissionCheck = await permissionGuard(request, 'read', 'project');
  if (permissionCheck instanceof Response) return permissionCheck;

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Project fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
} 