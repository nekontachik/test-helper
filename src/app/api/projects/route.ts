import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { Action, Resource } from '@/lib/auth/rbac/types';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const POST = withAuth(
  async (request: Request, session) => {
    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    return NextResponse.json(project, { status: 201 });
  },
  {
    requireVerified: true,
    action: Action.CREATE,
    resource: Resource.PROJECT,
    rateLimit: {
      points: 10,
      duration: 60, // 10 creates per minute
    },
  }
);

export const GET = withAuth(
  async (request: Request) => {
    const { searchParams } = new URL(request.url);
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
  },
  {
    action: Action.READ,
    resource: Resource.PROJECT,
  }
);
