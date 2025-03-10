'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * A skeleton loader for the test run execution page
 */
export function TestRunSkeleton(): JSX.Element {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Skeleton className="h-8 w-1/3 mb-2" />
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        
        <Skeleton className="h-10 w-32" />
      </div>
      
      <Tabs defaultValue="execution" className="w-full">
        <TabsList>
          <TabsTrigger value="execution" disabled>
            <Skeleton className="h-4 w-24" />
          </TabsTrigger>
          <TabsTrigger value="overview" disabled>
            <Skeleton className="h-4 w-32" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="execution">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
              
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
              
              <Skeleton className="h-1 w-full" />
              
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <div className="flex space-x-4 mb-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
                
                <div className="mb-4">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 