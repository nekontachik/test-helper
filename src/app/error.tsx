'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';
import { getUserFriendlyMessage } from '@/lib/client/errorHandler';

interface ApiErrorWithCode extends Error {
  code?: string;
}

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  // Extract error code if available
  const errorCode = error.name === 'ApiError' && 'code' in error && typeof (error as ApiErrorWithCode).code === 'string'
    ? (error as ApiErrorWithCode).code
    : error.message.includes('not found') || error.message.includes('404')
      ? 'NOT_FOUND'
      : error.message.includes('unauthorized') || error.message.includes('401')
        ? 'UNAUTHORIZED'
        : error.message.includes('forbidden') || error.message.includes('403')
          ? 'FORBIDDEN'
          : 'SERVER_ERROR';

  // Get user-friendly message
  const userFriendlyMessage = getUserFriendlyMessage(errorCode || 'SERVER_ERROR');

  // Log the error to the server
  useEffect(() => {
    logger.error('Client-side error:', {
      error: error.message,
      stack: error.stack,
      digest: error.digest,
      code: errorCode
    });
  }, [error, errorCode]);

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <Heading as="h2" size="lg" className="text-destructive">
            {errorCode}
          </Heading>
        </CardHeader>
        <CardContent>
          <VStack spacing="4" align="stretch">
            <Text>
              {userFriendlyMessage}
            </Text>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <Heading as="h3" size="sm" className="mb-2">
                  Error details (only visible in development):
                </Heading>
                <Text className="text-sm font-mono whitespace-pre-wrap">
                  {error.message}
                </Text>
                {error.digest && (
                  <Text className="text-xs text-muted-foreground mt-2">
                    Error ID: {error.digest}
                  </Text>
                )}
              </div>
            )}
          </VStack>
        </CardContent>
        <CardFooter>
          <HStack spacing="2" className="w-full justify-between">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button variant="default" onClick={() => window.location.href = '/'}>
              Go to Homepage
            </Button>
            <Button variant="secondary" onClick={reset}>
              Try Again
            </Button>
          </HStack>
        </CardFooter>
      </Card>
    </div>
  );
} 