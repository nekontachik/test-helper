import React from 'react';
import { HStack, Button } from '@chakra-ui/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <HStack spacing={2} justify="center" mt={4}>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'solid' : 'outline'}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
    </HStack>
  );
} 