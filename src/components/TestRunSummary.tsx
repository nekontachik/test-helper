'use client';

import React from 'react';
import { TestCaseResultStatus } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TestRunSummaryProps {
  name: string;
  results: Array<{
    status: TestCaseResultStatus;
  }>;
}

export function TestRunSummary({ name, results }: TestRunSummaryProps) {
  // Calculate statistics
  const statusCounts = results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {} as Partial<Record<TestCaseResultStatus, number>>);

  const total = results.length;
  const passedCount = statusCounts[TestCaseResultStatus.PASSED] || 0;

  const statusColors: Record<TestCaseResultStatus, string> = {
    [TestCaseResultStatus.PENDING]: 'bg-gray-300',
    [TestCaseResultStatus.PASSED]: 'bg-green-500',
    [TestCaseResultStatus.FAILED]: 'bg-red-500',
    [TestCaseResultStatus.BLOCKED]: 'bg-gray-500',
    [TestCaseResultStatus.SKIPPED]: 'bg-yellow-500',
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">{name}</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Progress</h3>
            <Progress value={(passedCount / total) * 100} />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Results</h3>
            <div className="grid gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status as TestCaseResultStatus]}`} />
                    <span className="text-sm">{status}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Summary</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted-foreground">Total Tests</dt>
                <dd className="text-2xl font-bold">{total}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Pass Rate</dt>
                <dd className="text-2xl font-bold">
                  {total > 0 ? Math.round((passedCount / total) * 100) : 0}%
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
