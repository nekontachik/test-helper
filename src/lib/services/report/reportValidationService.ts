import { ErrorFactory } from '@/lib/errors/ErrorFactory';
import type { ReportInput, ReportMetrics, TestRunData } from '../types';

export class ReportValidationService {
  private static TEST_STATUSES = ['PASSED', 'FAILED', 'SKIPPED'] as const;
  
  static validateInput(data: ReportInput): void {
    if (!data.title?.trim()) throw ErrorFactory.validation('Title is required');
    if (!data.projectId) throw ErrorFactory.validation('Project ID is required');
    if (data.title.length > 200) throw ErrorFactory.validation('Title exceeds maximum length of 200 characters');
    if (data.filters) this.validateFilters(data.filters);
  }

  static validateFilters(filters: NonNullable<ReportInput['filters']>): void {
    if (filters.status?.length) {
      const invalidStatus = filters.status.find(s => !this.TEST_STATUSES.includes(s as typeof this.TEST_STATUSES[number]));
      if (invalidStatus) throw ErrorFactory.validation(`Invalid status: ${invalidStatus}`);
    }

    if (filters.dateRange && filters.dateRange.start > filters.dateRange.end) {
      throw ErrorFactory.validation('Start date must be before end date');
    }
  }

  static isValidMetrics(metrics: unknown): metrics is ReportMetrics {
    if (!metrics || typeof metrics !== 'object') return false;
    const required = ['totalTests', 'passed', 'failed', 'skipped', 'blockers', 'executionTime', 'passRate'];
    return required.every(prop => prop in (metrics as object));
  }

  static isValidTestRunData(data: unknown): data is TestRunData {
    if (!data || typeof data !== 'object') return false;
    const required = ['testRun', 'results', 'summary'];
    return required.every(prop => prop in (data as object));
  }

  static isValidFilters(filters: unknown): filters is ReportInput['filters'] {
    if (!filters || typeof filters !== 'object') return false;
    const validKeys = ['status', 'dateRange', 'priority'];
    return validKeys.every(key => key in (filters as object));
  }

  static isValidReportContent(content: unknown): content is {
    metrics: ReportMetrics;
    testRunData?: TestRunData;
    filters?: ReportInput['filters'];
  } {
    if (!content || typeof content !== 'object') return false;
    const typedContent = content as Record<string, unknown>;
    return (
      'metrics' in typedContent &&
      this.isValidMetrics(typedContent.metrics) &&
      (!('testRunData' in typedContent) || this.isValidTestRunData(typedContent.testRunData)) &&
      (!('filters' in typedContent) || this.isValidFilters(typedContent.filters))
    );
  }

  // ... other validation methods
} 