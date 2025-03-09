import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export function ProjectsListSkeleton(): JSX.Element {
  // Create an array of 6 items for the skeleton
  const skeletonItems = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonItems.map((item) => (
          <Card key={item} className="h-full">
            <CardHeader>
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 