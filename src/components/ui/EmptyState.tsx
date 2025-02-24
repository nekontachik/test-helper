import { VStack, Text, Icon, Button } from '@chakra-ui/react';
import { FiInbox } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionVStack = motion(VStack);

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <MotionVStack
      spacing={4}
      py={8}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Icon as={FiInbox} boxSize={12} color="gray.400" />
      <Text color="gray.500">{message}</Text>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          onClick={onAction}
          size="sm"
        >
          {actionLabel}
        </Button>
      )}
    </MotionVStack>
  );
} 