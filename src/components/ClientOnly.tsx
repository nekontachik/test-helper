'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that only renders its children on the client side.
 * This helps prevent hydration mismatches between server and client rendering.
 * 
 * @param children - The content to render on the client
 * @param fallback - Optional content to show while waiting for client-side rendering
 */
export function ClientOnly({ children, fallback }: ClientOnlyProps): JSX.Element | null {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
} 