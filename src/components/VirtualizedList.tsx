'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useInView } from 'react-intersection-observer';
import { debounce } from 'lodash';
import { Box, Text } from '@chakra-ui/react';
import { ErrorBoundary } from 'react-error-boundary';

interface VirtualizedListProps<T> {
  data: T[];
  height: number;
  itemSize: number;
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactNode;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  className?: string;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
}

export function VirtualizedList<T>({
  data,
  height,
  itemSize,
  renderItem,
  onEndReached,
  endReachedThreshold = 0.8,
  className,
}: VirtualizedListProps<T>): JSX.Element {
  const [error, setError] = useState<Error | null>(null);
  const listRef = useRef<FixedSizeList>(null);
  const { ref: endRef, inView } = useInView({
    threshold: endReachedThreshold
  });

  const Row = useCallback(({ index, style }: RowProps) => (
    <div ref={index === data.length - 1 ? endRef : undefined} style={style}>
      {data[index] && renderItem({ item: data[index], index })}
    </div>
  ), [data, renderItem, endRef]);

  // Debounce end reached callback
  const debouncedEndReached = useCallback(
    debounce(() => onEndReached?.(), 200),
    [onEndReached]
  );

  useEffect(() => {
    if (inView) {
      debouncedEndReached();
    }
  }, [inView, debouncedEndReached]);

  const handleError = (error: Error): void => {
    console.error('VirtualizedList Error:', error);
    setError(error);
  };

  if (error) {
    return (
      <Box
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="red.50"
        color="red.600"
        p={4}
        borderRadius="md"
      >
        <Text>Error loading list: {error.message}</Text>
      </Box>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <Box height={height} p={4}>
          <Text color="red.500">Error: {error.message}</Text>
        </Box>
      )}
      onError={handleError}
    >
      <AutoSizer>
        {({ width }) => (
          <FixedSizeList
            ref={listRef}
            height={height}
            width={width}
            itemCount={data.length}
            itemSize={itemSize}
            onItemsRendered={({ visibleStartIndex, visibleStopIndex }) => {
              console.debug('Rendered items:', { visibleStartIndex, visibleStopIndex });
            }}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </ErrorBoundary>
  );
} 