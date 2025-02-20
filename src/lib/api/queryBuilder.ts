import { Prisma } from '@prisma/client';

type SortOrder = 'asc' | 'desc';

interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  filters?: Record<string, any>;
}

export function buildQuery<T extends Record<string, any>>(
  options: QueryOptions = {}
): Prisma.FindManyArgs<T> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    filters = {}
  } = options;

  const query: Prisma.FindManyArgs<T> = {
    where: filters,
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
  };

  return query;
}

export function buildPaginationResponse<T>(
  data: T[],
  total: number,
  options: QueryOptions
) {
  const { page = 1, limit = 10 } = options;
  
  return {
    data,
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      perPage: limit,
      hasMore: page * limit < total
    }
  };
} 