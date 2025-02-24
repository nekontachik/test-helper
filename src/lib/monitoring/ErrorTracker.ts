import type { ErrorSeverity } from '@/lib/errors/types';
import { logger } from '@/lib/utils/logger';

interface ErrorOccurrence {
  timestamp: Date;
  context: string;
  severity: ErrorSeverity;
  metadata?: Record<string, unknown>;
}

interface ErrorMetrics {
  count: number;
  lastOccurred: Date;
  occurrences: ErrorOccurrence[];
  byContext: Record<string, number>;
  bySeverity: Record<ErrorSeverity, number>;
}

export class ErrorTracker {
  private static metrics = new Map<string, ErrorMetrics>();

  static track(
    error: Error, 
    context = 'unknown', 
    severity: ErrorSeverity = 'error',
    metadata?: Record<string, unknown>
  ): void {
    const key = `${error.name}:${context}`;
    const now = new Date();
    
    const current = this.metrics.get(key) || {
      count: 0,
      lastOccurred: now,
      occurrences: [],
      byContext: {},
      bySeverity: { error: 0, warning: 0, info: 0 }
    };

    const errorMetadata = {
      message: error.message,
      stack: error.stack,
      timestamp: now.toISOString(),
      ...metadata
    };

    current.count++;
    current.lastOccurred = now;
    current.occurrences.push({
      timestamp: now,
      context,
      severity,
      metadata: errorMetadata
    });
    current.byContext[context] = (current.byContext[context] || 0) + 1;
    current.bySeverity[severity]++;

    this.metrics.set(key, current);

    logger.error('Error tracked:', {
      type: error.name,
      message: error.message,
      context,
      severity,
      count: current.count,
      stack: error.stack
    });
  }

  static getMetrics(): Record<string, ErrorMetrics> {
    return Object.fromEntries(this.metrics);
  }

  static getMetricsByType(errorType: string): ErrorMetrics | undefined {
    return Array.from(this.metrics.entries())
      .find(([key]) => key.startsWith(errorType))?.[1];
  }

  static reset(): void {
    this.metrics.clear();
  }
} 