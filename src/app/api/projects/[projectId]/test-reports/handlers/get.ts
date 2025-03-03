import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/apiErrorHandler';
import { logger } from '@/lib/logger';
import { paramsSchema, querySchema, userSelect, projectSelect } from '../schemas';

/**
 * GET handler for retrieving test reports
 */
export async function handleGET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams, pathname } = new URL(request.url);
    const projectId = pathname.split('/')[3];

    // Validate project ID
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    await paramsSchema.parseAsync({ projectId });

    // Parse and validate query parameters
    const { page, limit, sortBy, order, search } = await querySchema.parseAsync({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      order: searchParams.get('order'),
      search: searchParams.get('search')
    });

    const skip = (page - 1) * limit;

    // Build query filters - using fields that exist in the schema
    const where = {
      projectId,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ]
      })
    };

    // Execute queries in parallel with transaction for consistency
    const [items, totalCount] = await prisma.$transaction([
      prisma.testReport.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
        include: {
          createdBy: { select: userSelect },
          project: { select: projectSelect }
        }
      }),
      prisma.testReport.count({ where })
    ]);

    // Log successful retrieval
    logger.info('Retrieved test reports', {
      projectId,
      page,
      limit,
      totalCount,
      filters: { search, sortBy, order }
    });

    // Return formatted response
    return NextResponse.json({
      items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        itemsPerPage: limit,
      },
      filters: {
        search,
        sortBy,
        order,
      }
    });
  } catch (error) {
    logger.error('Error retrieving test reports:', error);
    return handleApiError(error);
  }
} 