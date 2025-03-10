'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableSkeleton } from './TableSkeleton';

/**
 * A skeleton loader for the report page
 */
export function ReportSkeleton(): JSX.Element {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-32" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary" disabled>
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
          <TabsTrigger value="results" disabled>
            <Skeleton className="h-4 w-32" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-64" />
              </CardTitle>
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-80">
                  <Skeleton className="h-full w-full rounded-md" />
                </div>
                <div className="h-80">
                  <Skeleton className="h-full w-full rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-64" />
              </CardTitle>
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <TableSkeleton columns={5} rows={8} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 