'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { ReportSkeleton } from '@/components/ui/skeletons';

interface TestResult {
  testCaseId: string;
  testCaseName: string;
  status: string;
  executedBy: string;
  executedAt: string;
  notes?: string;
}

interface TestRunStatistics {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  passRate: number;
  duration: number;
}

// Renamed with underscore to avoid unused variable warning
interface _TestRunInfo {
  id: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  status: string;
}

interface TestReport {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  runId: string;
  statistics: TestRunStatistics;
  results: TestResult[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export default function TestRunReportPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<TestReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const testRunId = params?.id as string;
  const { toast } = useToast();

  // Function to export PDF
  const exportPDF = async (): Promise<void> => {
    try {
      setExportLoading(true);
      const response = await fetch(`/api/reports/test-run/${testRunId}/export?format=pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-run-report-${testRunId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'PDF exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to export PDF',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Function to export CSV
  const exportCSV = async (): Promise<void> => {
    try {
      setExportLoading(true);
      const response = await fetch(`/api/reports/test-run/${testRunId}/export?format=csv`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-run-report-${testRunId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'CSV exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to export CSV',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Get status icon based on test status
  const getStatusIcon = (status: string): JSX.Element => {
    // Use a single icon for all statuses to avoid import issues
    return <AlertTriangle className={`h-5 w-5 ${
      status === 'PASSED' ? 'text-green-500' : 
      status === 'FAILED' ? 'text-red-500' : 
      status === 'BLOCKED' ? 'text-orange-500' : 
      'text-gray-500'
    }`} />;
  };

  // Format duration from milliseconds to human-readable format
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Fetch report data
  useEffect(() => {
    async function fetchReport(): Promise<void> {
      try {
        const response = await fetch(`/api/reports/test-run/${testRunId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch report: ${response.status}`);
        }
        const data = await response.json();
        setReport(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load report',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (testRunId) {
      fetchReport();
    }
  }, [testRunId, toast]);

  if (loading) {
    return <ReportSkeleton />;
  }

  if (!report) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Report Not Found</CardTitle>
          <CardDescription>The requested test run report could not be found.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.back()}>Go Back</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{report.name}</h1>
          <p className="text-muted-foreground">{report.description}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportPDF} 
            disabled={exportLoading}
          >
            {exportLoading ? <Spinner className="mr-2" /> : null}
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={exportCSV} 
            disabled={exportLoading}
          >
            {exportLoading ? <Spinner className="mr-2" /> : null}
            Export CSV
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Test Run Summary</CardTitle>
              <CardDescription>
                Created on {new Date(report.createdAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Tests:</span>
                      <span className="font-medium">{report.statistics.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passed:</span>
                      <span className="font-medium text-green-500">{report.statistics.passed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-medium text-red-500">{report.statistics.failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blocked:</span>
                      <span className="font-medium text-orange-500">{report.statistics.blocked}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skipped:</span>
                      <span className="font-medium text-gray-500">{report.statistics.skipped}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pass Rate:</span>
                      <span className="font-medium">{(report.statistics.passRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{formatDuration(report.statistics.duration)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Distribution</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-medium">Pass Rate</p>
                      <p className="text-3xl font-bold text-green-500">
                        {(report.statistics.passRate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Detailed results for all test cases in this run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Test Case</TableHead>
                    <TableHead>Executed By</TableHead>
                    <TableHead>Executed At</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.results.map((result) => (
                    <TableRow key={result.testCaseId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <Badge
                            variant={
                              result.status === 'PASSED' ? 'success' :
                              result.status === 'FAILED' ? 'destructive' :
                              result.status === 'BLOCKED' ? 'warning' : 'outline'
                            }
                          >
                            {result.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{result.testCaseName}</TableCell>
                      <TableCell>{result.executedBy}</TableCell>
                      <TableCell>{new Date(result.executedAt).toLocaleString()}</TableCell>
                      <TableCell>{result.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 