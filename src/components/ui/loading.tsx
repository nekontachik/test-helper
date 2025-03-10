import * as React from 'react';
import { Spinner, Text, VStack, Box, Center } from '@chakra-ui/react';
import { cn } from "@/lib/utils";

interface LoadingProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  fullPage?: boolean;
  centered?: boolean;
  className?: string;
}

export function Loading({ 
  text, 
  size = 'md', 
  color = 'primary',
  fullPage = false,
  centered = true,
  className,
  ...props
}: LoadingProps): JSX.Element {
  const content = (
    <VStack spacing={4} className={cn(className)}>
      <Spinner 
        size={size} 
        color={color}
        thickness="4px"
        speed="0.65s"
        {...props}
      />
      {text && <Text color="gray.600" fontSize="sm">{text}</Text>}
    </VStack>
  );

  if (fullPage) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        backgroundColor="rgba(255, 255, 255, 0.8)"
        zIndex={9999}
      >
        {content}
      </Box>
    );
  }

  if (centered) {
    return (
      <Center p={4}>
        {content}
      </Center>
    );
  }

  return content;
} 