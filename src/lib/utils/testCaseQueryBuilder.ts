import type { Prisma } from '@prisma/client';
import type { TestCaseStatus, TestCasePriority } from '@/types';

interface TestCaseFilter {
  status?: TestCaseStatus;
  priority?: TestCasePriority;
  search?: string;
  tags?: string[];
}

export const testCaseQueryBuilder = {
  buildFindManyQuery(
    projectId: string,
    filter?: TestCaseFilter,
    pagination?: { skip: number; take: number }
  ): Prisma.TestCaseFindManyArgs {
    const where: Prisma.TestCaseWhereInput = {
      projectId,
      deleted: false,
    };

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.priority) {
      where.priority = filter.priority;
    }

    if (filter?.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return {
      where,
      orderBy: { updatedAt: 'desc' },
      ...pagination,
    };
  }
}; 