'use client';

import { 
  Box, 
  Flex, 
  Button, 
  HStack, 
  useColorModeValue,
  IconButton,
  useDisclosure,
  VStack,
  CloseButton,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HamburgerIcon } from '@chakra-ui/icons';
import { SignOutButton } from './SignOutButton';

export function AuthNav(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');

  const NavContent = (): JSX.Element => (
    <>
      {session ? (
        <HStack spacing={4}>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/account/settings')}
          >
            Settings
          </Button>
          <SignOutButton />
        </HStack>
      ) : (
        <HStack spacing={4}>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/auth/signin')}
          >
            Sign In
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={() => router.push('/auth/signup')}
          >
            Sign Up
          </Button>
        </HStack>
      )}
    </>
  );

  return (
    <Box>
      {/* Desktop Navigation */}
      <Flex
        display={{ base: 'none', md: 'flex' }}
        justify="space-between"
        align="center"
      >
        <Box 
          cursor="pointer" 
          fontWeight="bold"
          onClick={() => router.push('/')}
        >
          Testing Buddy
        </Box>
        <NavContent />
      </Flex>

      {/* Mobile Navigation */}
      <Flex
        display={{ base: 'flex', md: 'none' }}
        justify="space-between"
        align="center"
      >
        <Box 
          cursor="pointer" 
          fontWeight="bold"
          onClick={() => router.push('/')}
        >
          TMS
        </Box>
        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          onClick={onToggle}
          variant="ghost"
        />
      </Flex>

      {/* Mobile Menu */}
      {isOpen && (
        <Box
          pos="fixed"
          top={0}
          right={0}
          bottom={0}
          w="full"
          maxW="sm"
          bg={bgColor}
          shadow="lg"
          p={4}
          zIndex={20}
        >
          <Flex justify="flex-end" mb={8}>
            <CloseButton onClick={onClose} />
          </Flex>
          <VStack spacing={4} align="stretch">
            <NavContent />
          </VStack>
        </Box>
      )}
    </Box>
  );
}
