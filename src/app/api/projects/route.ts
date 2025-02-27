import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSuccessResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withSimpleAuth } from '@/lib/auth/withSimpleAuth';
import { MOCK_USER } from '@/lib/auth/simpleAuth';
import { logger } from '@/lib/utils/logger';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional()
});

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        ...data,
        userId: MOCK_USER.id
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    logger.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

async function handleGET(request: NextRequest): Promise<NextResponse> {
  try {
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
  } catch (error) {
    logger.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export const POST = withSimpleAuth(handlePOST);
export const GET = withSimpleAuth(handleGET);
