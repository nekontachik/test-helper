import { Box, Skeleton, Stack, VStack, HStack, Grid, GridItem } from "@chakra-ui/react";

export function TestRunDetailsSkeleton() {
  return (
    <VStack spacing={6} width="100%" align="stretch">
      <Skeleton height="40px" width="70%" />
      
      <Stack direction={{ base: "column", md: "row" }} spacing={4}>
        <Skeleton height="24px" width="150px" />
        <Skeleton height="24px" width="120px" />
        <Skeleton height="24px" width="180px" />
      </Stack>
      
      <Box p={5} borderWidth="1px" borderRadius="md">
        <VStack align="stretch" spacing={4}>
          <Skeleton height="24px" width="200px" />
          
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            <GridItem>
              <VStack align="stretch">
                <Skeleton height="100px" borderRadius="md" />
                <Skeleton height="20px" width="80%" />
              </VStack>
            </GridItem>
            <GridItem>
              <VStack align="stretch">
                <Skeleton height="100px" borderRadius="md" />
                <Skeleton height="20px" width="80%" />
              </VStack>
            </GridItem>
            <GridItem>
              <VStack align="stretch">
                <Skeleton height="100px" borderRadius="md" />
                <Skeleton height="20px" width="80%" />
              </VStack>
            </GridItem>
          </Grid>
        </VStack>
      </Box>
      
      <Box>
        <Skeleton height="30px" width="200px" mb={4} />
        <VStack spacing={3} align="stretch">
          {Array.from({ length: 8 }).map((_, i) => (
            <HStack key={i} p={3} borderWidth="1px" borderRadius="md" spacing={4}>
              <Skeleton height="24px" width="24px" borderRadius="full" />
              <Skeleton height="20px" flex="1" />
              <Skeleton height="20px" width="100px" />
              <Skeleton height="20px" width="80px" />
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
} 