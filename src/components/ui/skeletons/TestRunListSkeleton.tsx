import { Box, Skeleton, Stack, VStack } from "@chakra-ui/react";

export function TestRunListSkeleton(): JSX.Element {
  return (
    <VStack spacing={4} width="100%" align="stretch">
      <Skeleton height="40px" width="200px" />
      
      {Array.from({ length: 5 }).map((_, i) => (
        <Box 
          key={i} 
          p={4} 
          borderWidth="1px" 
          borderRadius="md" 
          width="100%"
        >
          <Stack spacing={3}>
            <Skeleton height="24px" width="70%" />
            <Skeleton height="16px" width="40%" />
            <Stack direction="row" spacing={4}>
              <Skeleton height="20px" width="100px" />
              <Skeleton height="20px" width="120px" />
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Skeleton height="16px" width="120px" />
              <Skeleton height="16px" width="80px" />
            </Stack>
          </Stack>
        </Box>
      ))}
    </VStack>
  );
} 