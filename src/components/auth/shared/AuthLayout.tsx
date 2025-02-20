'use client';

import { Box, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  error: string | null;
  isLoading: boolean;
  buttonText: string;
  alternateLink: {
    text: string;
    linkText: string;
    href: string;
  };
  onSubmit: () => void;
  children: React.ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  error,
  isLoading,
  buttonText,
  alternateLink,
  onSubmit,
  children,
}: AuthLayoutProps) {
  return (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          {title}
        </Text>
        <Text color="gray.600">
          {subtitle}{' '}
          <Link 
            href={alternateLink.href} 
            className="text-blue-600 hover:underline"
          >
            {alternateLink.linkText}
          </Link>
        </Text>
      </Box>

      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {children}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? <Spinner className="mr-2" /> : null}
          {buttonText}
        </Button>
      </form>
    </VStack>
  );
} 