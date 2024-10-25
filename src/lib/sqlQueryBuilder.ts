import { Prisma } from '@prisma/client';

export class SQLQueryBuilder {
  static sanitizeValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }
    return String(value);
  }

  static buildInsertQuery(table: string, data: Record<string, unknown>): Prisma.Sql {
    const columns = Object.keys(data);
    const values = columns.map(col => this.sanitizeValue(data[col]));

    return Prisma.sql`
      INSERT INTO ${Prisma.raw(table)} (${Prisma.raw(columns.join(', '))})
      VALUES (${Prisma.raw(values.join(', '))})
      RETURNING *
    `;
  }

  static buildSelectQuery(
    table: string,
    where: Record<string, unknown> = {},
    orderBy?: { column: string; direction: 'ASC' | 'DESC' }
  ): Prisma.Sql {
    const conditions = Object.entries(where)
      .map(([col, val]) => `${col} = ${this.sanitizeValue(val)}`)
      .join(' AND ');

    const orderByClause = orderBy
      ? `ORDER BY ${orderBy.column} ${orderBy.direction}`
      : '';

    return Prisma.sql`
      SELECT * FROM ${Prisma.raw(table)}
      ${conditions ? Prisma.raw(`WHERE ${conditions}`) : Prisma.empty}
      ${orderByClause ? Prisma.raw(orderByClause) : Prisma.empty}
    `;
  }
}
