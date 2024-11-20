import { NextResponse } from 'next/server';
import { createSecureRoute, SecureRouteContext } from '@/lib/api/createSecureRoute';
import { Action, Resource } from '@/types/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.string().optional(),
});

export const PUT = createSecureRoute(
  async (request: Request, context: SecureRouteContext) => {
    try {
      const body = await request.json();
      const data = updateProjectSchema.parse(body);

      const project = await prisma.project.update({
        where: { id: context.params.projectId },
        data,
      });

      return NextResponse.json(project);
    } catch (error) {
      console.error('Project update error:', error);
      return NextResponse.json(
        { message: 'Failed to update project' },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    requireVerified: true,
    requireCsrf: true,
    action: Action.UPDATE,
    resource: Resource.PROJECT,
    rateLimit: {
      points: 30,
      duration: 60,
    },
    audit: {
      action: 'project.update',
      getMetadata: async (request: Request, context: SecureRouteContext) => ({
        projectId: context.params.projectId,
        changes: await request.json(),
      }),
    },
  }
);
