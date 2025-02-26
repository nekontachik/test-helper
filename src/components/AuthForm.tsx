'use client';

import type { StackProps } from '@chakra-ui/react';
import { VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface AuthFormProps extends StackProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  children: ReactNode;
  width?: string | number;
}

export function AuthForm({ 
  onSubmit, 
  children, 
  width = "100%",
  ...props 
}: AuthFormProps): JSX.Element {
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width }}>
      <VStack spacing={6} width="100%" {...props}>
        {children}
      </VStack>
    </form>
  );
}
