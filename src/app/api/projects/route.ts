import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';

async function handler(req: Request) {
  if (req.method === 'GET') {
    const projects = await prisma.project.findMany();
    return NextResponse.json(projects);
  }
  // ... other methods
}

export const GET = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER, UserRole.USER]
});

export const POST = withAuth(handler, {
  allowedRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER]
});

// Implement PUT, DELETE methods similarly
