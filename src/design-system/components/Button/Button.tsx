'use client';

import React, { useMemo } from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';
import type { ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { useDesignSystem } from '../../ThemeProvider';

/**
 * Button component props
 * @property {string} variant - The visual style of the button
 * @property {string} colorScheme - The color scheme of the button
 * @property {string} size - The size of the button
 */
export interface ButtonProps extends Omit<ChakraButtonProps, 'colorScheme'> {
  /** The visual style of the button */
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  /** The color scheme of the button */
  colorScheme?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  /** The size of the button */
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * Button component that follows the design system
 * @param props - Button props
 * @returns JSX.Element
 */
export const Button = React.memo(function Button({
  variant = 'solid',
  colorScheme = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps): JSX.Element {
  const { isDarkMode } = useDesignSystem();
  
  /**
   * Maps our colorScheme to Chakra UI colorScheme
   * @returns The Chakra UI colorScheme
   */
  const chakraColorScheme = useMemo((): string => {
    switch (colorScheme) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'gray';
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'info':
        return 'blue';
      default:
        return 'primary';
    }
  }, [colorScheme]);
  
  /**
   * Generates styles based on variant and dark mode
   * @returns The styles object
   */
  const styles = useMemo((): Record<string, unknown> => {
    // Base styles
    const baseStyles = {
      fontWeight: 'medium',
      borderRadius: 'md',
      _focus: {
        boxShadow: `0 0 0 3px ${isDarkMode ? 'rgba(56, 189, 248, 0.6)' : 'rgba(14, 165, 233, 0.6)'}`,
      },
    };
    
    // Variant-specific styles
    if (variant === 'solid') {
      return {
        ...baseStyles,
        _hover: {
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        },
      };
    }
    
    if (variant === 'outline') {
      return {
        ...baseStyles,
        borderWidth: '2px',
        _hover: {
          transform: 'translateY(-1px)',
        },
      };
    }
    
    return baseStyles;
  }, [variant, isDarkMode]);
  
  return (
    <ChakraButton
      variant={variant}
      colorScheme={chakraColorScheme}
      size={size}
      sx={styles}
      {...props}
    >
      {children}
    </ChakraButton>
  );
}); 