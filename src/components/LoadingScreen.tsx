import { Box, VStack, Spinner, Text } from '@chakra-ui/react'

interface LoadingScreenProps {
  message?: string
}

const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps): JSX.Element => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text>{message}</Text>
      </VStack>
    </Box>
  )
}

export default LoadingScreen 