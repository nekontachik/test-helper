import { Prisma } from '@prisma/client';
import type { FilterCondition, WhereClause } from './filters';
import { ApiError } from 'next';

export interface QueryOptions<T extends Record<string, any>> {
  select?: (keyof T)[];
  include?: Partial<Record<keyof T, boolean | object>>;
  where?: WhereClause<T>;
  filters?: FilterCondition<T>[];
  orderBy?: Partial<Record<keyof T, 'asc' | 'desc'>>;
  page?: number;
  limit?: number;
  distinct?: keyof T;
}

export class PrismaQueryBuilder<T extends Record<string, any>> {
  private readonly MAX_LIMIT = 50;
  private readonly DEFAULT_LIMIT = 10;
  private readonly ALLOWED_OPERATORS = new Set([
    'equals', 'not', 'in', 'notIn', 'lt', 'lte', 'gt', 'gte',
    'contains', 'startsWith', 'endsWith', 'some', 'every', 'none'
  ]);

  constructor(private readonly model: string) {}

  private validateQueryOptions(options: QueryOptions<T>) {
    // Essential validations only
    if (options.page && (options.page < 1 || !Number.isInteger(options.page))) {
      throw new ApiError('Invalid page number', 400);
    }

    if (options.limit && (options.limit < 1 || options.limit > this.MAX_LIMIT)) {
      throw new ApiError(`Limit must be between 1 and ${this.MAX_LIMIT}`, 400);
    }

    if (options.filters?.length) {
      options.filters.forEach(filter => {
        if (!['equals', 'contains', 'in'].includes(filter.operator)) {
          throw new ApiError('Unsupported filter operator', 400);
        }
      });
    }
  }

  buildQuery(options: QueryOptions<T>): Prisma.PrismaPromise<T[]> {
    this.validateQueryOptions(options);
    return {
      where: this.buildWhere(options.where, options.filters),
      select: this.buildSelect(options.select),
      include: options.include,
      orderBy: options.orderBy,
      distinct: options.distinct,
      ...(options.page && options.limit ? {
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      } : {}),
    };
  }

  private buildWhere(where?: WhereClause<T>, filters?: FilterCondition<T>[]): Prisma.WhereInput {
    const baseWhere = where || {};
    if (!filters?.length) return baseWhere;

    const filterConditions = filters.reduce((acc, filter) => {
      const condition = this.buildFilterCondition(filter);
      if (filter.isRelation) {
        acc[filter.field] = { some: condition };
      } else {
        acc[filter.field] = condition;
      }
      return acc;
    }, {} as Record<string, any>);

    return { ...baseWhere, ...filterConditions };
  }

  private buildFilterCondition(filter: FilterCondition<T>): any {
    const { operator, value } = filter;

    switch (operator) {
      case 'equals':
      case 'not':
      case 'lt':
      case 'lte':
      case 'gt':
      case 'gte':
        return { [operator]: value };
      case 'in':
      case 'notIn':
        return { [operator]: Array.isArray(value) ? value : [value] };
      case 'contains':
      case 'startsWith':
      case 'endsWith':
        return { [operator]: value, mode: 'insensitive' };
      case 'some':
      case 'every':
      case 'none':
        return { [operator]: value };
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  private buildSelect(fields?: (keyof T)[]): Prisma.SelectSubset<T, T> | undefined {
    if (!fields?.length) return undefined;
    return fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
  }

  private isValidField(field: keyof T): boolean {
    // Get model metadata from Prisma
    const model = Prisma.dmmf.datamodel.models.find(m => m.name === this.model);
    if (!model) return false;
    
    return model.fields.some(f => f.name === field);
  }
} 