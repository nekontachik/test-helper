'use client';

import React from 'react';
import { 
  Box, 
  Flex, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  Icon,
  Skeleton,
  SkeletonText, 
  useColorModeValue 
} from '@chakra-ui/react';
import type { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  stat: string | number;
  icon: IconType;
  helpText?: string;
  colorScheme?: string;
  isLoading?: boolean;
}

export function StatCard({ 
  title, 
  stat, 
  icon, 
  helpText, 
  colorScheme = 'blue',
  isLoading = false 
}: StatCardProps): JSX.Element {
  // Define color mode values at the top level to avoid conditional hooks
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const iconBg = useColorModeValue(`${colorScheme}.100`, `${colorScheme}.900`);
  const iconColor = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.200`);
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  return (
    <Stat
      px={4}
      py={5}
      bg={bgColor}
      borderColor={borderColor}
      borderWidth="1px"
      rounded="lg"
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
      position="relative"
      overflow="hidden"
    >
      <Flex justifyContent="space-between">
        <Box pl={2} flex="1">
          {isLoading ? (
            <>
              <SkeletonText noOfLines={1} width="80px" mb={2} />
              <Skeleton height="36px" width="100px" mb={2} />
              {helpText && <SkeletonText noOfLines={1} width="120px" />}
            </>
          ) : (
            <>
              <StatLabel 
                fontWeight="medium" 
                isTruncated
                color={textColor}
                fontSize="sm"
              >
                {title}
              </StatLabel>
              <StatNumber 
                fontSize="2xl" 
                fontWeight="bold"
                bgGradient={`linear(to-r, ${colorScheme}.500, ${colorScheme}.300)`}
                bgClip="text"
              >
                {stat}
              </StatNumber>
              {helpText && (
                <StatHelpText fontSize="sm" color={textColor}>
                  {helpText}
                </StatHelpText>
              )}
            </>
          )}
        </Box>
        <Box
          my="auto"
          alignContent="center"
          borderRadius="full"
          bg={iconBg}
          p={2}
          opacity={isLoading ? 0.5 : 1}
          transition="opacity 0.2s"
        >
          <Icon 
            as={icon} 
            boxSize={6} 
            color={iconColor}
            transition="transform 0.2s"
            _groupHover={{ transform: 'scale(1.1)' }}
          />
        </Box>
      </Flex>
    </Stat>
  );
} 