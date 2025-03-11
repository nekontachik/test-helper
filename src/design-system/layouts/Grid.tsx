'use client';

import React, { useMemo } from 'react';
import { Grid as ChakraGrid, GridItem as ChakraGridItem } from '@chakra-ui/react';
import type { GridProps as ChakraGridProps, GridItemProps as ChakraGridItemProps } from '@chakra-ui/react';
import { spacingSystem } from '../foundations/spacing';

/**
 * Grid component props
 * @property {number | object} columns - The number of columns or responsive columns object
 * @property {string | number} spacing - The spacing between grid items
 */
export interface GridProps extends ChakraGridProps {
  /** The number of columns or responsive columns object */
  columns?: number | { [key: string]: number };
  /** The spacing between grid items */
  spacing?: keyof typeof spacingSystem.spacing | number;
}

/**
 * Grid component that provides consistent grid layout
 * @param props - Grid props
 * @returns JSX.Element
 */
export const Grid = React.memo(function Grid({
  columns = { base: 1, md: 2, lg: 3 },
  spacing = 4,
  children,
  ...props
}: GridProps): JSX.Element {
  /**
   * Converts columns to templateColumns
   */
  const templateColumns = useMemo(() => {
    if (typeof columns === 'number') {
      return `repeat(${columns}, 1fr)`;
    }
    
    // If columns is an object, it's responsive
    return undefined;
  }, [columns]);
  
  /**
   * Converts responsive columns to responsive object
   */
  const responsiveColumns = useMemo(() => {
    if (typeof columns === 'number') {
      return undefined;
    }
    
    // Convert { base: 1, md: 2, lg: 3 } to { base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }
    const result: { [key: string]: string } = {};
    Object.entries(columns).forEach(([breakpoint, value]) => {
      result[breakpoint] = `repeat(${value}, 1fr)`;
    });
    
    return result;
  }, [columns]);
  
  /**
   * Gets spacing value based on the spacing prop
   */
  const spacingValue = useMemo(() => {
    return typeof spacing === 'number'
      ? spacing
      : spacingSystem.spacing[spacing];
  }, [spacing]);
  
  /**
   * Combines all grid props
   */
  const gridProps = useMemo(() => {
    return {
      templateColumns,
      gap: spacingValue,
      ...(responsiveColumns && {
        templateColumns: responsiveColumns,
      }),
    };
  }, [templateColumns, spacingValue, responsiveColumns]);
  
  return (
    <ChakraGrid
      {...gridProps}
      {...props}
    >
      {children}
    </ChakraGrid>
  );
});

/**
 * GridItem component props
 * @property {number | object} colSpan - The number of columns to span or responsive object
 * @property {number | object} rowSpan - The number of rows to span or responsive object
 */
export interface GridItemProps extends ChakraGridItemProps {
  /** The number of columns to span or responsive object */
  colSpan?: number | { [key: string]: number };
  /** The number of rows to span or responsive object */
  rowSpan?: number | { [key: string]: number };
}

/**
 * GridItem component that provides consistent grid item layout
 * @param props - GridItem props
 * @returns JSX.Element
 */
export const GridItem = React.memo(function GridItem({
  colSpan,
  rowSpan,
  children,
  ...props
}: GridItemProps): JSX.Element {
  /**
   * Processes colSpan prop
   */
  const processedColSpan = useMemo(() => {
    if (typeof colSpan === 'number' || colSpan === undefined) {
      return colSpan;
    }
    
    return colSpan;
  }, [colSpan]);
  
  /**
   * Processes rowSpan prop
   */
  const processedRowSpan = useMemo(() => {
    if (typeof rowSpan === 'number' || rowSpan === undefined) {
      return rowSpan;
    }
    
    return rowSpan;
  }, [rowSpan]);
  
  return (
    <ChakraGridItem
      colSpan={processedColSpan}
      rowSpan={processedRowSpan}
      {...props}
    >
      {children}
    </ChakraGridItem>
  );
}); 