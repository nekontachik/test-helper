import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { protect } from '@/lib/auth/protect';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';
import { handleApiError } from '@/lib/api/errorHandler';

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional()
});

// @ts-expect-error - The protect function expects NextRequest but we're using AuthenticatedRequest
export const POST = protect(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const data = await createProjectSchema.parseAsync(body);
    
    // Create project data with proper null handling for description
    const projectData = {
      name: data.name,
      userId: req.user.id,
      // Convert undefined to null for Prisma
      description: data.description ?? null
    };
    
    const project = await prisma.project.create({
      data: projectData
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});

// @ts-expect-error - The protect function expects NextRequest but we're using a custom handler
export const GET = protect(async (req: NextRequest, _context: { params: Record<string, string>; session: unknown }) => {
  try {
    const url = new URL(req.url);
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
    
    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching projects', { error });
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}, {
  roles: ['ADMIN', 'MANAGER', 'EDITOR', 'TESTER'],
  requireVerified: true,
  rateLimit: { points: 100, duration: 60 }
});
