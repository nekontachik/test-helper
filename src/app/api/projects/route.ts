import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@/types/api';
import { withProtect } from '@/middleware/apiProtect';
import { withAuthorization } from '@/middleware/authorize';
import { Action, Resource } from '@/types/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { Session } from 'next-auth';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional()
});

async function handlePOST(request: Request, context: { session: Session }): Promise<Response> {
  const body = await request.json();
  const data = createProjectSchema.parse(body);

  const project = await prisma.project.create({
    data: {
      ...data,
      userId: context.session.user.id
    }
  });

  return NextResponse.json(project, { status: 201 });
}

async function handleGET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.project.count()
  ]);

  const response = createSuccessResponse({
    items: projects,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalCount: total
  });

  return NextResponse.json(response);
}

export const POST = withProtect(
  withAuthorization(handlePOST as (request: Request) => Promise<Response>, {
    action: Action.CREATE,
    resource: Resource.PROJECT,
    allowTeamMembers: false
  }),
  {
    action: Action.CREATE,
    resource: Resource.PROJECT,
    allowUnverified: false,
    rateLimit: {
      points: 10,
      duration: 60
    }
  }
);

export const GET = withProtect(
  withAuthorization(handleGET, {
    action: Action.READ,
    resource: Resource.PROJECT,
    allowTeamMembers: true
  }),
  {
    action: Action.READ,
    resource: Resource.PROJECT,
    allowUnverified: false,
    rateLimit: {
      points: 100,
      duration: 60
    }
  }
);
