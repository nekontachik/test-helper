import { protect } from '@/lib/auth/protect';
import { getProject } from './handlers/getProject';
import { updateProject } from './handlers/updateProject';
import { deleteProject } from './handlers/deleteProject';
import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';
import type { NextResponse } from 'next/server';
import type { UserRole } from '@/types/auth';

// Create wrapper functions with proper types
const getProjectHandler = (
  req: Request | NextRequest,
  context: { params: Record<string, string>; session: Session }
): Promise<NextResponse> => {
  // Ensure id exists before passing it
  if (!context.params.id) {
    throw new Error('Project ID is required');
  }
  return getProject(req, {
    params: { id: context.params.id },
    session: context.session
  });
};

const updateProjectHandler = (
  req: Request | NextRequest,
  context: { params: Record<string, string>; session: Session }
): Promise<NextResponse> => {
  // Ensure id exists before passing it
  if (!context.params.id) {
    throw new Error('Project ID is required');
  }
  return updateProject(req, {
    params: { id: context.params.id },
    session: context.session
  });
};

const deleteProjectHandler = (
  req: Request | NextRequest,
  context: { params: Record<string, string>; session: Session }
): Promise<NextResponse> => {
  // Ensure id exists before passing it
  if (!context.params.id) {
    throw new Error('Project ID is required');
  }
  return deleteProject(req, {
    params: { id: context.params.id },
    session: context.session
  });
};

// Export the protected route handlers with type assertions for roles
export const GET = protect(getProjectHandler, {
  roles: ['ADMIN', 'MANAGER', 'TESTER', 'USER'] as UserRole[],
  audit: true,
  auditAction: 'PROJECT_VIEW'
});

export const PUT = protect(updateProjectHandler, {
  roles: ['ADMIN', 'MANAGER', 'EDITOR'] as UserRole[],
  requireVerified: true,
  audit: true,
  auditAction: 'PROJECT_UPDATE'
});

export const DELETE = protect(deleteProjectHandler, {
  roles: ['ADMIN', 'MANAGER'] as UserRole[],
  requireVerified: true,
  rateLimit: { points: 10, duration: 60 },
  audit: true,
  auditAction: 'PROJECT_DELETE'
}); 