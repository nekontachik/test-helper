export type ComparisonOperator = 'equals' | 'not' | 'in' | 'notIn' | 'lt' | 'lte' | 'gt' | 'gte';
export type StringOperator = 'contains' | 'startsWith' | 'endsWith';
export type ArrayOperator = 'some' | 'every' | 'none';

export type FilterOperator = ComparisonOperator | StringOperator | ArrayOperator;

export interface FilterCondition<T> {
  field: keyof T;
  operator: FilterOperator;
  value: unknown;
  isRelation?: boolean;
}

export type WhereClause<T> = {
  AND?: WhereClause<T>[];
  OR?: WhereClause<T>[];
  NOT?: WhereClause<T>;
} & {
  [P in keyof T]?: T[P] | Record<string, unknown>;
}; 