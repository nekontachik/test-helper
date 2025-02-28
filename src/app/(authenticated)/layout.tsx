'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Navbar from '@/components/Navbar'
import { useProjectCheck } from '@/lib/withProjectCheck';

// Create a client component wrapper that provides the QueryClient
function AuthenticatedLayoutContent({ children }: { children: React.ReactNode }): JSX.Element {
  const { hasProjects = false } = useProjectCheck();
  
  return (
    <div className="authenticated-layout">
      <Navbar hasProjects={hasProjects} />
      <main className="authenticated-main">
        {children}
      </main>
    </div>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  // Create a new QueryClient instance for each request
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedLayoutContent>
        {children}
      </AuthenticatedLayoutContent>
    </QueryClientProvider>
  );
} 