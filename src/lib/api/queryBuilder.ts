type SortOrder = 'asc' | 'desc';

interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  filters?: Record<string, unknown>;
}

// Define a more specific type for Prisma query arguments
interface FindManyArgs<_TRecord> {
  where?: Record<string, unknown>;
  orderBy?: Record<string, string>;
  skip?: number;
  take?: number;
  include?: Record<string, boolean | Record<string, unknown>>;
  select?: Record<string, boolean | Record<string, unknown>>;
}

export function buildQuery<T extends Record<string, unknown>>(
  options: QueryOptions = {}
): FindManyArgs<T> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    filters = {}
  } = options;

  const query: FindManyArgs<T> = {
    where: filters,
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
  };

  return query;
}

interface PaginationResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
    hasMore: boolean;
  };
}

export function buildPaginationResponse<T>(
  data: T[],
  total: number,
  options: QueryOptions
): PaginationResponse<T> {
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