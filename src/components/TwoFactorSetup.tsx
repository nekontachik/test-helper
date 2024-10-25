'use client';

import { useState } from 'react';
import {
  VStack,
  Text,
  Button,
  useToast,
  Box,
  Code,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { AuthCard } from './AuthCard';
import QRCode from 'qrcode.react';

interface TwoFactorSetupProps {
  email: string;
  onComplete: () => void;
}

export function TwoFactorSetup({ email, onComplete }: TwoFactorSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to setup 2FA');
      }

      const { secret, qrCodeUrl } = await response.json();
      setQrCode(qrCodeUrl);
      onOpen();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to setup 2FA. Please try again.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (code: string) => {
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      const { backupCodes } = await response.json();
      setBackupCodes(backupCodes);
      onComplete();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid verification code. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <AuthCard title="Two-Factor Authentication Setup">
      <VStack spacing={6} align="stretch">
        <Text>
          Enhance your account security by enabling two-factor authentication.
          You'll need an authenticator app like Google Authenticator or Authy.
        </Text>

        <Button
          onClick={handleSetup2FA}
          colorScheme="blue"
          isLoading={isLoading}
        >
          Set up 2FA
        </Button>

        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Scan QR Code</ModalHeader>
            <ModalBody>
              <VStack spacing={6}>
                <Box p={4} bg="white" borderRadius="md">
                  <QRCode value={qrCode} size={200} />
                </Box>
                <Text>
                  Scan this QR code with your authenticator app, then enter the
                  verification code below.
                </Text>
                {backupCodes.length > 0 && (
                  <Alert status="warning">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Save your backup codes</AlertTitle>
                      <AlertDescription>
                        <Text mb={4}>
                          Store these backup codes in a safe place. You can use
                          them to access your account if you lose your
                          authenticator device.
                        </Text>
                        <Code p={4} borderRadius="md">
                          {backupCodes.join('\n')}
                        </Code>
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </AuthCard>
  );
}
