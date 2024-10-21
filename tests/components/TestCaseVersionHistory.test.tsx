import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestCaseVersionHistory } from '@/components/TestCaseVersionHistory';
import { useTestCaseVersions } from '@/hooks/useTestCases';

jest.mock('@/hooks/useTestCases');

const mockVersions = [
  { versionNumber: 2, updatedAt: '2023-05-02T10:00:00Z', title: 'Updated Test Case' },
  { versionNumber: 1, updatedAt: '2023-05-01T10:00:00Z', title: 'Original Test Case' },
];

describe('TestCaseVersionHistory', () => {
  beforeEach(() => {
    (useTestCaseVersions as jest.Mock).mockReturnValue({
      data: mockVersions,
      isLoading: false,
      error: null,
    });
  });

  it('renders version history correctly', () => {
    render(
      <ChakraProvider>
        <TestCaseVersionHistory projectId="project1" testCaseId="case1" />
      </ChakraProvider>
    );

    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('Version 2')).toBeInTheDocument();
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Updated Test Case')).toBeInTheDocument();
    expect(screen.getByText('Original Test Case')).toBeInTheDocument();
  });

  it('calls onVersionChange when a version is selected', async () => {
    const mockOnVersionChange = jest.fn();
    render(
      <ChakraProvider>
        <TestCaseVersionHistory
          projectId="project1"
          testCaseId="case1"
          onVersionChange={mockOnVersionChange}
        />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Version 1'));

    await waitFor(() => {
      expect(mockOnVersionChange).toHaveBeenCalledWith(1);
    });
  });

  it('displays loading state', () => {
    (useTestCaseVersions as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(
      <ChakraProvider>
        <TestCaseVersionHistory projectId="project1" testCaseId="case1" />
      </ChakraProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    (useTestCaseVersions as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch versions'),
    });

    render(
      <ChakraProvider>
        <TestCaseVersionHistory projectId="project1" testCaseId="case1" />
      </ChakraProvider>
    );

    expect(screen.getByText('Error loading versions: Failed to fetch versions')).toBeInTheDocument();
  });

  it('displays "No versions available" when there are no versions', () => {
    (useTestCaseVersions as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(
      <ChakraProvider>
        <TestCaseVersionHistory projectId="project1" testCaseId="case1" />
      </ChakraProvider>
    );

    expect(screen.getByText('No versions available')).toBeInTheDocument();
  });
});
