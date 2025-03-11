'use client';

import React from 'react';
import { Button, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import Link from 'next/link';

interface QuickActionButtonProps {
  icon: IconType;
  label: string;
  href: string;
  colorScheme?: string;
}

export function QuickActionButton({ 
  icon, 
  label, 
  href, 
  colorScheme = 'blue' 
}: QuickActionButtonProps): JSX.Element {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`);
  
  return (
    <Link href={href} passHref style={{ textDecoration: 'none', width: '100%' }}>
      <Button
        as="div"
        height="auto"
        width="100%"
        p={6}
        bg={bgColor}
        boxShadow="md"
        borderRadius="lg"
        variant="outline"
        borderColor={borderColor}
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
          borderColor: `${colorScheme}.400`,
          bg: hoverBg
        }}
        transition="all 0.3s"
      >
        <VStack spacing={3}>
          <Icon as={icon} boxSize={8} color={`${colorScheme}.500`} />
          <Text fontWeight="medium">{label}</Text>
        </VStack>
      </Button>
    </Link>
  );
} 