import '@tanstack/react-query';
import { QueryClientProvider as OriginalQueryClientProvider } from '@tanstack/react-query';
import { ComponentType } from 'react';

declare module '@tanstack/react-query' {
  interface QueryClientProviderProps {
    children?: React.ReactNode;
  }

  export const QueryClientProvider: ComponentType<{ client: QueryClient }>;
}
