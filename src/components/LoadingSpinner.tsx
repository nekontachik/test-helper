import { Spinner, Box } from '@chakra-ui/react'

interface LoadingSpinnerProps {
  size?: string
}

const LoadingSpinner = ({ size = 'xl' }: LoadingSpinnerProps): JSX.Element => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" h="200px">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size={size}
      />
    </Box>
  )
}

export default LoadingSpinner
