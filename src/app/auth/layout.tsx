import { Box } from '@chakra-ui/react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg="gray.50"
    >
      <Box 
        w="full" 
        maxW="md" 
        p={8} 
        bg="white" 
        rounded="lg" 
        shadow="md"
      >
        {children}
      </Box>
    </Box>
  );
} 