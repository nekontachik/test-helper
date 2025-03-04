import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { X } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import type { TestSuite } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export function TestSuitesSection(): JSX.Element {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentTestSuites = async (): Promise<void> => {
      try {
        setLoading(true);
        // Assuming we're getting test suites for a specific project or all projects
        // This might need adjustment based on your actual API structure
        const data = await apiClient.testSuites.getTestSuites('recent');
        setTestSuites(data.slice(0, 5)); // Show only 5 most recent test suites
        setError(null);
      } catch (err) {
        console.error('Failed to fetch test suites:', err);
        setError('Failed to load recent test suites');
        toast({
          title: 'Error',
          description: 'Failed to load recent test suites',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTestSuites();
  }, [toast]);

  if (loading) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <h3 className="text-sm font-medium">Recent Test Suites</h3>
          <Skeleton className="h-8 w-8" />
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-2">
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <h3 className="text-sm font-medium">Recent Test Suites</h3>
          <Button size="sm" variant="outline">
            <Link href="/test-suites/new">
              <X className="mr-1 h-4 w-4" />
              New
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-sm font-medium">Recent Test Suites</h3>
        <Button size="sm" variant="outline">
          <Link href="/test-suites/new">
            <X className="mr-1 h-4 w-4" />
            New
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {testSuites.length === 0 ? (
          <div className="text-sm text-muted-foreground">No test suites found</div>
        ) : (
          <div className="space-y-2">
            {testSuites.map((suite) => (
              <div key={suite.id} className="flex items-center justify-between">
                <Link
                  href={`/test-suites/${suite.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {suite.name}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {suite.testCases?.length || 0} test cases
                </div>
              </div>
            ))}
          </div>
        )}
        {testSuites.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="link" size="sm">
              <Link href="/test-suites">View all test suites</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 