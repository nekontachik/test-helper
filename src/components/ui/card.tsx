'use client';

import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import React from 'react';

type CardProps = BoxProps & {
  children: ReactNode;
};

export function Card({ children, ...props }: CardProps): React.ReactElement {
  return <Box borderWidth="1px" borderRadius="lg" overflow="hidden" {...props}>{children}</Box>;
}

type CardSectionProps = BoxProps & {
  children: ReactNode;
};

export function CardHeader({ children, ...props }: CardSectionProps): React.ReactElement {
  return <Box borderBottomWidth="1px" p={4} {...props}>{children}</Box>;
}

export function CardContent({ children, ...props }: CardSectionProps): React.ReactElement {
  return <Box p={4} {...props}>{children}</Box>;
}

export function CardFooter({ children, ...props }: CardSectionProps): React.ReactElement {
  return <Box borderTopWidth="1px" p={4} {...props}>{children}</Box>;
} 