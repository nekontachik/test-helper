'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Header } from '@/components/navigation/Header';
import { useProjectCheck } from '@/lib/withProjectCheck';
import { Sidebar } from '@/components/navigation/Sidebar';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { useSynchronizedTheme } from '@/lib/ui-utils';
import { useTheme } from '@/components/providers/ThemeProvider';

// Create a client component wrapper that provides the QueryClient
function AuthenticatedLayoutContent({ children }: { children: React.ReactNode }): JSX.Element {
  // We'll keep the project check for future use but prefix with _ to indicate it's not currently used
  const { hasProjects: _hasProjects = false } = useProjectCheck();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Use our custom hook to synchronize themes
  useSynchronizedTheme();
  
  // Add dark class to body when needed
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  return (
    <LayoutProvider>
      <div className={`authenticated-layout ${isDarkMode ? 'dark' : ''}`}>
        <Header />
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