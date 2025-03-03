'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useInView } from 'react-intersection-observer';
import { Box, Text } from '@chakra-ui/react';
import { ErrorBoundary } from 'react-error-boundary';

interface VirtualizedListProps<T> {
  data: T[];
  height: number;
  itemSize: number;
  renderType?: string; // Use a string identifier instead of a function
  onEndReached?: string; // Event name to trigger when end is reached
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
  renderType = 'default',
  onEndReached,
  endReachedThreshold = 0.8,
  className,
}: VirtualizedListProps<T>): JSX.Element {
  const [error, setError] = useState<Error | null>(null);
  const listRef = useRef<FixedSizeList>(null);
  const { ref: endRef, inView } = useInView({
    threshold: endReachedThreshold
  });

  // Define renderItem function here in the client component
  const renderItem = useCallback(({ item, index }: { item: T; index: number }) => {
    const itemRecord = item as Record<string, unknown>;
    const title = String(itemRecord.title || itemRecord.name || `Item ${index}`);
    const description = itemRecord.description ? String(itemRecord.description) : '';
    const date = itemRecord.date ? String(itemRecord.date) : '';
    
    // Choose rendering based on renderType
    switch (renderType) {
      case 'compact':
        return (
          <div className="py-1 px-2">
            <div className="text-sm">{title}</div>
          </div>
        );
      case 'detailed':
        return (
          <div className="p-3 border-b">
            <div className="font-medium">{title}</div>
            {description && <div className="text-sm text-gray-500">{description}</div>}
            {date && <div className="text-xs text-gray-400">{date}</div>}
          </div>
        );
      default:
        return (
          <div className="p-2 border-b">
            <div>{title}</div>
            {description && <div className="text-sm text-gray-500">{description}</div>}
          </div>
        );
    }
  }, [renderType]);

  const Row = useCallback(({ index, style }: RowProps) => (
    <div ref={index === data.length - 1 ? endRef : undefined} style={style}>
      {data[index] && renderItem({ item: data[index], index })}
    </div>
  ), [data, renderItem, endRef]);

  // Handle end reached
  useEffect(() => {
    if (inView && onEndReached) {
      // Dispatch a custom event that can be listened to
      const event = new CustomEvent(onEndReached, { detail: { endReached: true } });
      window.dispatchEvent(event);
    }
  }, [inView, onEndReached]);

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
      <div className={className}>
        <AutoSizer>
          {({ width }) => (
            <FixedSizeList
              ref={listRef}
              height={height}
              width={width}
              itemCount={data.length}
              itemSize={itemSize}
            >
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      </div>
    </ErrorBoundary>
  );
} 