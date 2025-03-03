'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Text, useToast } from '@chakra-ui/react';

// Define a type for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt(): JSX.Element | null {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install button
      setShowPrompt(true);
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      // Log app installed
      console.log('PWA was installed');
      // Hide the prompt
      setShowPrompt(false);
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      // Show toast
      toast({
        title: 'App installed!',
        description: 'The app was successfully installed on your device.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    });
  }, [toast]);

  const handleInstallClick = async (): Promise<void> => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Log outcome
    console.log(`User response to install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <Box 
      position="fixed"
      bottom="20px"
      right="20px"
      bg="white"
      p={4}
      borderRadius="md"
      boxShadow="lg"
      zIndex={1000}
      maxWidth="300px"
    >
      <Text mb={3}>Install our app for a better experience!</Text>
      <Button colorScheme="blue" onClick={handleInstallClick}>
        Install
      </Button>
      <Button 
        variant="ghost" 
        ml={2} 
        onClick={() => setShowPrompt(false)}
      >
        Not now
      </Button>
    </Box>
  );
} 