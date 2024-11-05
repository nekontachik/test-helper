import { NextResponse } from 'next/server';
import { createSecureRoute } from '@/lib/api/createSecureRoute';
import { Action, Resource } from '@/types/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.string().optional(),
});

export const PUT = createSecureRoute(
  async (request: Request) => {
    const body = await request.json();
    const { projectId } = request.params;
    const data = updateProjectSchema.parse(body);

    const project = await prisma.project.update({
      where: { id: projectId },
      data,
    });

    return NextResponse.json(project);
  },
  {
    requireAuth: true,
    requireVerified: true,
    requireCsrf: true,
    action: Action.UPDATE,
    resource: Resource.PROJECT,
    rateLimit: {
      points: 30,
      duration: 60, // 30 updates per minute
    },
    audit: {
      action: 'project.update',
      getMetadata: async (req) => ({
        projectId: req.params.projectId,
        changes: await req.json(),
      }),
    },
  }
);
