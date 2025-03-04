'use client';

import Link from 'next/link';
import { Card, CardBody, Flex, Icon, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import type { IconType } from 'react-icons';

interface QuickLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: IconType;
}

export function QuickLinkCard({ title, description, href, icon }: QuickLinkCardProps): JSX.Element {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card 
      as={Link}
      href={href}
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="lg"
      _hover={{ 
        transform: 'translateY(-4px)', 
        shadow: 'md', 
        borderColor: 'blue.400' 
      }}
      transition="all 0.2s"
    >
      <CardBody>
        <Flex align="center" mb={2}>
          <Icon as={icon} boxSize={5} color="blue.500" mr={2} />
          <Heading size="sm">{title}</Heading>
        </Flex>
        <Text fontSize="sm" color="gray.500">{description}</Text>
      </CardBody>
    </Card>
  );
} 