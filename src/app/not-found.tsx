'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { logger } from '@/lib/logger';

export default function NotFound(): JSX.Element {
  logger.info('Rendering NotFound page');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-3xl">404</span>
            <span>Page Not Found</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VStack spacing={4} align="stretch">
            <Text>
              The page you are looking for does not exist or has been moved.
            </Text>
            <Text className="text-sm text-gray-500">
              Please check the URL or navigate to another page using the links below.
            </Text>
          </VStack>
        </CardContent>
        <CardFooter>
          <HStack spacing={2} className="w-full justify-between">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Link href="/" passHref>
              <Button>
                Return Home
              </Button>
            </Link>
          </HStack>
        </CardFooter>
      </Card>
    </div>
  );
} 