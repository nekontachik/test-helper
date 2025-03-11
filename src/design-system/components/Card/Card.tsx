'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import type { BoxProps, FlexProps } from '@chakra-ui/react';
import { useDesignSystem } from '../../ThemeProvider';

/**
 * Card component props
 * @property {string} variant - The visual style of the card
 */
export interface CardProps extends BoxProps {
  /** The visual style of the card */
  variant?: 'elevated' | 'outline' | 'filled' | 'unstyled';
}

/**
 * Card component that follows the design system
 * @param props - Card props
 * @returns JSX.Element
 */
export const Card = React.memo(function Card({
  variant = 'elevated',
  children,
  ...props
}: CardProps): JSX.Element {
  const { isDarkMode } = useDesignSystem();
  
  /**
   * Generates styles based on variant and dark mode
   * @returns The styles object
   */
  const styles = useMemo((): Record<string, unknown> => {
    // Base styles
    const baseStyles = {
      borderRadius: 'lg',
      overflow: 'hidden',
      transition: 'all 0.2s ease-in-out',
    };
    
    // Variant-specific styles
    if (variant === 'elevated') {
      return {
        ...baseStyles,
        bg: isDarkMode ? 'gray.800' : 'white',
        boxShadow: isDarkMode ? 'dark-lg' : 'md',
        _hover: {
          boxShadow: isDarkMode ? 'dark-xl' : 'lg',
          transform: 'translateY(-2px)',
        },
      };
    }
    
    if (variant === 'outline') {
      return {
        ...baseStyles,
        bg: 'transparent',
        borderWidth: '1px',
        borderColor: isDarkMode ? 'gray.700' : 'gray.200',
      };
    }
    
    if (variant === 'filled') {
      return {
        ...baseStyles,
        bg: isDarkMode ? 'gray.700' : 'gray.100',
      };
    }
    
    // Unstyled
    return baseStyles;
  }, [variant, isDarkMode]);
  
  return (
    <Box
      {...props}
      sx={{
        ...styles,
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
});

/**
 * Card header component
 * @param props - FlexProps
 * @returns JSX.Element
 */
export const CardHeader = React.memo(function CardHeader({
  children,
  ...props
}: FlexProps): JSX.Element {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Flex
      direction="column"
      p={4}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      {...props}
    >
      {children}
    </Flex>
  );
});

/**
 * Card title props
 */
export interface CardTitleProps {
  /** The content of the card title */
  children: React.ReactNode;
}

/**
 * Card title component
 * @param props - CardTitleProps
 * @returns JSX.Element
 */
export const CardTitle = React.memo(function CardTitle({ 
  children 
}: CardTitleProps): JSX.Element {
  return (
    <Heading size="md" mb={2}>
      {children}
    </Heading>
  );
});

/**
 * Card description props
 */
export interface CardDescriptionProps {
  /** The content of the card description */
  children: React.ReactNode;
}

/**
 * Card description component
 * @param props - CardDescriptionProps
 * @returns JSX.Element
 */
export const CardDescription = React.memo(function CardDescription({ 
  children 
}: CardDescriptionProps): JSX.Element {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  return (
    <Text color={textColor} fontSize="sm">
      {children}
    </Text>
  );
});

/**
 * Card content component
 * @param props - FlexProps
 * @returns JSX.Element
 */
export const CardContent = React.memo(function CardContent({
  children,
  ...props
}: FlexProps): JSX.Element {
  return (
    <Flex direction="column" p={4} {...props}>
      {children}
    </Flex>
  );
});

/**
 * Card footer component
 * @param props - FlexProps
 * @returns JSX.Element
 */
export const CardFooter = React.memo(function CardFooter({
  children,
  ...props
}: FlexProps): JSX.Element {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Flex
      p={4}
      borderTopWidth="1px"
      borderTopColor={borderColor}
      justify="flex-end"
      align="center"
      {...props}
    >
      {children}
    </Flex>
  );
}); 