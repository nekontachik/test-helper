import { NextResponse } from 'next/server';
import { permissionGuard } from '@/middleware/permissionGuard';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Check permissions with correct number of arguments
  const permissionCheck = await permissionGuard(request, {
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    requireVerified: true
  });
  
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