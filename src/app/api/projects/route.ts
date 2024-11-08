import { NextResponse } from 'next/server';
import { withProtect } from '@/middleware/apiProtect';
import { withAuthorization } from '@/middleware/authorize';
import { Action, Resource } from '@/types/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { Session } from 'next-auth';
import type { NextRequest } from 'next/server';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

async function handlePOST(request: NextRequest, session: Session) {
  const body = await request.json();
  const data = createProjectSchema.parse(body);

  const project = await prisma.project.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  });

  return NextResponse.json(project, { status: 201 });
}

async function handleGET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.count(),
  ]);

  return NextResponse.json({
    items: projects,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalCount: total,
  });
}

export const POST = withProtect(
  withAuthorization(handlePOST as any, {
    action: Action.CREATE,
    resource: Resource.PROJECT,
    allowTeamMembers: false,
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
  withAuthorization(handleGET as any, {
    action: Action.READ,
    resource: Resource.PROJECT,
    allowTeamMembers: true,
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
