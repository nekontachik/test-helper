'use client';

import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import { QuickActionButton } from '@/components/Dashboard/QuickActionButton';
import type { QuickAction } from '../types';
import type { UserRole } from '@/types/auth';

interface QuickActionsSectionProps {
  actions: QuickAction[];
  userRole: UserRole;
  onNavigate?: (path: string) => void;
}

export const QuickActionsSection = ({ 
  actions, 
  userRole, 
  onNavigate 
}: QuickActionsSectionProps): JSX.Element => {
  // Filter actions based on user role
  const filteredActions = actions.filter(action => {
    // If action requires specific roles and user doesn't have any of them, hide the action
    if (action.requiredRoles && 
        !action.requiredRoles.some((role: UserRole) => userRole === role)) {
      return false;
    }
    return true;
  });

  return (
    <Box mb={8}>
      <Heading size="md" mb={4}>
        Quick Actions
      </Heading>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {filteredActions.map((action, index) => (
          <QuickActionButton
            key={index}
            label={action.label}
            icon={action.icon}
            href={onNavigate ? '#' : action.href}
            colorScheme={action.colorScheme}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default QuickActionsSection; 