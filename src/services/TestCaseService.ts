import { BaseService } from '@/lib/services/BaseService';
import { prisma } from '@/lib/prisma';
import { TestCase, TestCaseInput } from '@/types';
import { validateRequest } from '@/lib/validations/validateRequest';
import { testCaseSchema } from '@/lib/validations/schema';
import { FilterCondition } from '@/lib/db/filters';

export class TestCaseService extends BaseService<TestCase> {
  constructor() {
    super(prisma.testCase, 'TestCase');
  }

  async createWithValidation(input: TestCaseInput): Promise<TestCase> {
    const validated = await testCaseSchema.parseAsync(input);
    return this.create(validated);
  }

  async findByProject(projectId: string) {
    return this.findMany({
      filters: { projectId },
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  async updateWithValidation(id: string, input: Partial<TestCaseInput>): Promise<TestCase> {
    const validated = await testCaseSchema.partial().parseAsync(input);
    return this.update(id, validated);
  }

  async findByProjectWithFilters(
    projectId: string,
    options: {
      status?: TestCaseStatus;
      priority?: TestCasePriority;
      search?: string;
    } = {}
  ) {
    const filters = [
      { field: 'projectId', operator: 'equals', value: projectId },
      ...(options.status ? [{ field: 'status', operator: 'equals', value: options.status }] : []),
      ...(options.priority ? [{ field: 'priority', operator: 'equals', value: options.priority }] : []),
      ...(options.search ? [{ 
        field: 'title', 
        operator: 'contains', 
        value: options.search.toLowerCase() 
      }] : [])
    ];

    return this.findMany({
      filters,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
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
  }) {
    const filters: FilterCondition<TestCase>[] = [
      { field: 'projectId', operator: 'equals', value: params.projectId },
      ...(params.status ? [{ field: 'status', operator: 'in', value: params.status }] : []),
      ...(params.priority ? [{ field: 'priority', operator: 'in', value: params.priority }] : []),
      ...(params.search ? [{
        field: 'title',
        operator: 'contains',
        value: params.search.toLowerCase()
      }] : []),
      ...(params.assignedTo ? [{
        field: 'assignees',
        operator: 'some',
        value: { userId: { in: params.assignedTo } },
        isRelation: true
      }] : []),
      ...(params.tags ? [{
        field: 'tags',
        operator: 'some',
        value: { name: { in: params.tags } },
        isRelation: true
      }] : []),
      ...(params.updatedAfter ? [{
        field: 'updatedAt',
        operator: 'gte',
        value: params.updatedAfter
      }] : [])
    ];

    return this.findMany({
      filters,
      orderBy: { updatedAt: 'desc' },
      include: {
        project: { select: { id: true, name: true } },
        assignees: { select: { user: { select: { id: true, name: true } } } },
        tags: true
      },
      page: params.page,
      limit: params.limit
    });
  }
}

// Create singleton instance
export const testCaseService = new TestCaseService(); 