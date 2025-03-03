import { prisma } from '@/lib/prisma';
import type { TestCase, TestCaseStatus, TestCasePriority } from '@/types';
import { z } from 'zod';

// Define TestCaseInput type since it's missing from @/types
export interface TestCaseInput {
  projectId: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  priority: TestCasePriority;
  status: TestCaseStatus;
}

// Create testCaseSchema since it's missing from @/lib/validations/schema
const testCaseSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  steps: z.array(z.string()),
  expectedResult: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'DELETED']).default('DRAFT'),
});

// Implement a custom service
export class TestCaseService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private prismaModel: any;

  constructor() {
    this.prismaModel = prisma.testCase;
  }

  async createWithValidation(input: TestCaseInput): Promise<TestCase> {
    const validated = await testCaseSchema.parseAsync(input);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.create(validated as any);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any): Promise<TestCase> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prismaModel.create({ data }) as any;
  }

  async findByProject(projectId: string): Promise<TestCase[]> {
    return this.findMany({
      filters: { projectId },
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  async findMany(options: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filters?: any;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    include?: any;
    page?: number;
    limit?: number;
  }): Promise<TestCase[]> {
    const { filters, sortBy, sortOrder, include, page, limit } = options;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prismaModel.findMany({
      where: filters,
      orderBy: sortBy ? { [sortBy]: sortOrder || 'asc' } : undefined,
      include,
      skip: page && limit ? (page - 1) * limit : undefined,
      take: limit,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
  }

  async updateWithValidation(id: string, input: Partial<TestCaseInput>): Promise<TestCase> {
    const validated = await testCaseSchema.partial().parseAsync(input);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.update(id, validated as any);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(id: string, data: any): Promise<TestCase> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prismaModel.update({
      where: { id },
      data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
  }

  async findByProjectWithFilters(
    projectId: string,
    options: {
      status?: TestCaseStatus;
      priority?: TestCasePriority;
      search?: string;
    } = {}
  ): Promise<TestCase[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = { projectId };

    if (options.status) {
      filters.status = options.status;
    }

    if (options.priority) {
      filters.priority = options.priority;
    }

    if (options.search) {
      filters.title = { contains: options.search.toLowerCase() };
    }

    return this.findMany({
      filters,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  }

  async findWithComplexFilters(params: {
    projectId: string;
    status?: TestCaseStatus[];
    priority?: TestCasePriority[];
    search?: string;
    assignedTo?: string[];
    tags?: string[];
    updatedAfter?: Date;
    page?: number;
    limit?: number;
  }): Promise<TestCase[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      projectId: params.projectId,
    };

    if (params.status?.length) {
      where.status = { in: params.status };
    }

    if (params.priority?.length) {
      where.priority = { in: params.priority };
    }

    if (params.search) {
      where.title = { contains: params.search.toLowerCase() };
    }

    if (params.assignedTo?.length) {
      where.assignees = {
        some: { userId: { in: params.assignedTo } }
      };
    }

    if (params.tags?.length) {
      where.tags = {
        some: { name: { in: params.tags } }
      };
    }

    if (params.updatedAfter) {
      where.updatedAt = { gte: params.updatedAfter };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prismaModel.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        assignees: true,
        tags: true,
      },
      skip: params.page && params.limit ? (params.page - 1) * params.limit : undefined,
      take: params.limit,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;
  }
}

// Create singleton instance
export const testCaseService = new TestCaseService(); 