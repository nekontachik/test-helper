'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Box, Heading, Text, Button, VStack, HStack, Code, 
  Container, Badge, Alert, AlertIcon, AlertTitle, AlertDescription, useToast } from '@chakra-ui/react';

export default function TestPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [localAuthInfo, setLocalAuthInfo] = useState<{
    hasAuthToken: boolean;
    hasUserData: boolean;
    hasRefreshToken: boolean;
    hasSessionId: boolean;
  } | null>(null);
  const [cookies, setCookies] = useState<string[]>([]);

  // Get URL parameters
  const fromRedirect = searchParams?.get('fromRedirect') === 'true';
  const redirectCount = parseInt(searchParams?.get('redirectCount') || '0', 10);
  const _referer = typeof window !== 'undefined' ? document.referrer : '';

  // Function to check auth info
  const checkAuthInfo = useCallback(() => {
    if (typeof window !== 'undefined') {
      const authToken = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      const refreshToken = localStorage.getItem('refreshToken');
      const sessionId = localStorage.getItem('sessionId');
      
      setLocalAuthInfo({
        hasAuthToken: !!authToken,
        hasUserData: !!userData,
        hasRefreshToken: !!refreshToken,
        hasSessionId: !!sessionId
      });

      setIsAuthenticated(sessionStatus === 'authenticated' || !!authToken);
    }
  }, [sessionStatus]);

  // Function to check cookies
  const checkCookies = useCallback(() => {
    if (typeof window !== 'undefined') {
      const cookieList = document.cookie.split(';').map(c => c.trim());
      setCookies(cookieList);
    }
  }, []);

  // Clear all auth state
  const clearAuthState = useCallback(() => {
    // Clear localStorage items
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionId');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Update state
    checkAuthInfo();
    checkCookies();
    
    toast({
      title: "Authentication cleared",
      description: "All authentication data has been removed",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, [checkAuthInfo, checkCookies, toast]);

  // Check auth data on mount
  useEffect(() => {
    checkAuthInfo();
    checkCookies();
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      checkAuthInfo();
      checkCookies();
    }, 2000); // Refresh every 2 seconds
    
    return () => clearInterval(intervalId);
  }, [checkAuthInfo, checkCookies]);
  
  const handleClearAuth = (): void => {
    clearAuthState();
    toast({
      title: "Authentication cleared",
      description: "All authentication data has been removed",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    // Reload the page after a short delay
    setTimeout(() => window.location.reload(), 500);
  };
  
  const handleFixRedirects = (): void => {
    // Try to navigate to dashboard with special params to break loops
    const dashboardUrl = new URL('/dashboard', window.location.href);
    dashboardUrl.searchParams.set('bypass', 'true');
    dashboardUrl.searchParams.set('preventRedirect', 'true');
    router.push(dashboardUrl.toString());
  };
  
  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">Authentication Test Page</Heading>
        <Text textAlign="center">This page displays authentication state information to help debug redirect issues.</Text>
        
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>
              Authentication Status: 
              <Badge 
                ml={2} 
                colorScheme={isAuthenticated ? "green" : "red"}
              >
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </AlertTitle>
            <AlertDescription>
              <Text>From Redirect: {fromRedirect || 'false'}</Text>
              <Text>Redirect Count: {redirectCount || '0'}</Text>
            </AlertDescription>
          </Box>
        </Alert>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={3}>NextAuth Session Status</Heading>
          <HStack>
            <Text fontWeight="bold">Status:</Text>
            <Badge colorScheme={
              sessionStatus === 'authenticated' ? 'green' : 
              sessionStatus === 'loading' ? 'yellow' : 'red'
            }>
              {sessionStatus}
            </Badge>
          </HStack>
          
          {session && (
            <Box mt={3}>
              <Text fontWeight="bold">User:</Text>
              <Code p={2} mt={1} display="block" whiteSpace="pre-wrap">
                {JSON.stringify(session.user, null, 2)}
              </Code>
            </Box>
          )}
        </Box>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={3}>Local Storage Authentication</Heading>
          {localAuthInfo ? (
            <VStack align="stretch" spacing={2}>
              <HStack>
                <Text>Auth Token:</Text>
                <Badge colorScheme={localAuthInfo.hasAuthToken ? 'green' : 'red'}>
                  {localAuthInfo.hasAuthToken ? 'Present' : 'Missing'}
                </Badge>
              </HStack>
              <HStack>
                <Text>User Data:</Text>
                <Badge colorScheme={localAuthInfo.hasUserData ? 'green' : 'red'}>
                  {localAuthInfo.hasUserData ? 'Present' : 'Missing'}
                </Badge>
              </HStack>
              <HStack>
                <Text>Refresh Token:</Text>
                <Badge colorScheme={localAuthInfo.hasRefreshToken ? 'green' : 'red'}>
                  {localAuthInfo.hasRefreshToken ? 'Present' : 'Missing'}
                </Badge>
              </HStack>
              <HStack>
                <Text>Session ID:</Text>
                <Badge colorScheme={localAuthInfo.hasSessionId ? 'green' : 'red'}>
                  {localAuthInfo.hasSessionId ? 'Present' : 'Missing'}
                </Badge>
              </HStack>
            </VStack>
          ) : (
            <Text>Loading local storage data...</Text>
          )}
        </Box>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={3}>Cookie Information</Heading>
          {cookies.length > 0 ? (
            <VStack align="stretch" spacing={1}>
              {cookies.map((cookie, index) => (
                <Text key={index} fontSize="sm">{cookie}</Text>
              ))}
            </VStack>
          ) : (
            <Text>No cookies found</Text>
          )}
        </Box>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={3}>Actions</Heading>
          <VStack align="stretch" spacing={4}>
            <Button colorScheme="red" onClick={handleClearAuth}>
              Clear All Auth Data
            </Button>
            <Button colorScheme="blue" onClick={handleFixRedirects}>
              Try to Fix Redirect Loop
            </Button>
            <Button onClick={() => router.push('/auth/signin')}>
              Go to Sign In
            </Button>
            <Button onClick={() => router.push('/dashboard?bypass=true')}>
              Go to Dashboard (Bypass Auth)
            </Button>
          </VStack>
        </Box>

        <Alert status="info">
          <AlertIcon />
          <VStack align="start">
            <Text>If you&apos;re experiencing redirect loops, try these steps:</Text>
            <Text>1. Clear auth data using the button above</Text>
            <Text>2. Navigate directly to /auth/signin</Text>
            <Text>3. If problems persist, clear browser cookies and try again</Text>
          </VStack>
        </Alert>
      </VStack>
    </Container>
  );
} 