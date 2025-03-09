'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Navbar from '@/components/Navbar'
import { useProjectCheck } from '@/lib/withProjectCheck';
import { Sidebar } from '@/components/navigation/Sidebar';
import { LayoutProvider } from '@/contexts/LayoutContext';

// Create a client component wrapper that provides the QueryClient
function AuthenticatedLayoutContent({ children }: { children: React.ReactNode }): JSX.Element {
  const { hasProjects = false } = useProjectCheck();
  
  return (
    <LayoutProvider>
      <div className="authenticated-layout">
        <Navbar hasProjects={hasProjects} />
        <div className="flex h-[calc(100vh-var(--navbar-height,60px))]">
          <Sidebar />
          <main className="authenticated-main flex-1 pt-[var(--navbar-height,60px)] ml-0 md:ml-[240px] p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </LayoutProvider>
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