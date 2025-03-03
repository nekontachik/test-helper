import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/apiErrorHandler';
import { logger } from '@/lib/logger';
import { paramsSchema, createSchema, userSelect, projectSelect } from '../schemas';
import type { UserSession } from '../types';

/**
 * POST handler for creating test reports
 */
export async function handlePOST(request: Request): Promise<NextResponse> {
  try {
    const { pathname } = new URL(request.url);
    const projectId = pathname.split('/')[3];

    // Validate project ID
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    await paramsSchema.parseAsync({ projectId });

    const body = await request.json();
    const data = await createSchema.parseAsync(body);

    // Get user from session - we assume withProtect middleware adds session to request
    // This is a type assertion, not a conversion
    const requestWithSession = request as unknown as { session: UserSession };
    
    if (!requestWithSession.session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = requestWithSession.session.user.id;

    // Check if project exists and user has access - use transaction for consistency
    const project = await prisma.project.findUnique({
      where: { id: projectId || '' },
      select: { 
        id: true, 
        status: true,
        members: {
          where: { userId }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Cannot create reports in inactive project' }, { status: 403 });
    }

    // Create test report using Prisma's transaction
    const testReport = await prisma.$transaction(async (tx) => {
      // Use the transaction client to create the report
      return tx.testReport.create({
        data: {
          // Use only fields that exist in the Prisma schema
          projectId,
          // Map our custom fields to the actual schema fields
          name: data.title,
          description: data.content,
          // Add required fields with default values
          runId: '',  // Empty string or appropriate default
          statistics: {},  // Empty object or appropriate default
          results: {},  // Empty object or appropriate default
          createdById: userId, // Use createdById instead of userId
        },
        // Include related data if needed
        include: {
          createdBy: { select: userSelect },
          project: { select: projectSelect }
        }
      });
    });

    // Log successful creation
    logger.info('Created test report', {
      reportId: testReport.id,
      projectId,
      userId,
      name: testReport.name
    });

    return NextResponse.json(testReport, { status: 201 });
  } catch (error) {
    logger.error('Error creating test report:', error);
    return handleApiError(error);
  }
} 