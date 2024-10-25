'use client';

import { VStack, StackProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

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
}: AuthFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
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
