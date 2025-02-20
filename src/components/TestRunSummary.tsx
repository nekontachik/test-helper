'use client';

import React from 'react';
import type { TestResult } from '@/types/testResults';
import { TestCaseResultStatus } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface TestRunSummaryProps {
  results: TestResult[];
  name?: string;
  isLoading?: boolean;
  error?: string;
}

export function TestRunSummary({ 
  results, 
  name = 'Test Run Summary',
  isLoading = false,
  error
}: TestRunSummaryProps) {
  if (error) {
    return (
      <Card className="bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = results.length;
  const passed = results.filter(r => r.status === TestCaseResultStatus.PASSED).length;
  const failed = results.filter(r => r.status === TestCaseResultStatus.FAILED).length;
  const skipped = results.filter(r => r.status === TestCaseResultStatus.SKIPPED).length;

  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const statusColors: Record<TestCaseResultStatus, string> = {
    [TestCaseResultStatus.PASSED]: 'bg-green-500 hover:bg-green-600',
    [TestCaseResultStatus.FAILED]: 'bg-red-500 hover:bg-red-600',
    [TestCaseResultStatus.SKIPPED]: 'bg-yellow-500 hover:bg-yellow-600',
  };

  const statusDescriptions: Record<TestCaseResultStatus, string> = {
    [TestCaseResultStatus.PASSED]: 'Tests that completed successfully',
    [TestCaseResultStatus.FAILED]: 'Tests that did not meet expected results',
    [TestCaseResultStatus.SKIPPED]: 'Tests that were intentionally skipped',
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Progress 
                      value={passRate} 
                      aria-label={`Test progress: ${passRate}% complete`}
                      className="cursor-help"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{passRate}% of tests passed</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Results</h3>
            <div className="grid gap-2">
              {Object.entries({
                [TestCaseResultStatus.PASSED]: passed,
                [TestCaseResultStatus.FAILED]: failed,
                [TestCaseResultStatus.SKIPPED]: skipped,
              }).map(([status, count]) => (
                <TooltipProvider key={status}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 cursor-help">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${statusColors[status as TestCaseResultStatus]}`}
                            aria-hidden="true"
                          />
                          <span className="text-sm">{status}</span>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{statusDescriptions[status as TestCaseResultStatus]}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                <dd className="text-2xl font-bold">{passRate}%</dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
