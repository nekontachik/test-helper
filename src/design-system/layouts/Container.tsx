'use client';

import React, { useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { spacingSystem } from '../foundations/spacing';

/**
 * Container component props
 * @property {string} maxWidth - The maximum width of the container
 * @property {boolean} centerContent - Whether to center the content vertically
 */
export interface ContainerProps extends BoxProps {
  /** The maximum width of the container */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'container';
  /** Whether to center the content vertically */
  centerContent?: boolean;
}

/**
 * Container component that provides consistent layout
 * @param props - Container props
 * @returns JSX.Element
 */
export const Container = React.memo(function Container({
  maxWidth = 'container',
  centerContent = false,
  children,
  ...props
}: ContainerProps): JSX.Element {
  /**
   * Maps maxWidth to pixel values
   * @returns The max width value
   */
  const maxWidthValue = useMemo((): string => {
    switch (maxWidth) {
      case 'sm':
        return '640px';
      case 'md':
        return '768px';
      case 'lg':
        return '1024px';
      case 'xl':
        return '1280px';
      case '2xl':
        return '1536px';
      case 'full':
        return '100%';
      case 'container':
      default:
        return '1200px';
    }
  }, [maxWidth]);
  
  /**
   * Generates center content props if needed
   */
  const centerContentProps = useMemo(() => {
    return centerContent ? {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    } : {};
  }, [centerContent]);
  
  return (
    <Box
      width="100%"
      maxWidth={maxWidthValue}
      mx="auto"
      px={spacingSystem.layout.contentPadding}
      {...centerContentProps}
      {...props}
    >
      {children}
    </Box>
  );
}); 