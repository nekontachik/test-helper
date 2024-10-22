import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Pagination } from '@/components/Pagination';

describe('Pagination', () => {
  it('renders correctly', () => {
    const onPageChange = jest.fn();
    const { getByText } = render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
    );

    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('5')).toBeInTheDocument();
  });

  it('calls onPageChange when clicking on a page number', () => {
    const onPageChange = jest.fn();
    const { getByText } = render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
    );

    fireEvent.click(getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
