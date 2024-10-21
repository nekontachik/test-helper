import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestSuiteList } from '@/components/TestSuiteList';
import { useTestSuites } from '../../hooks/useTestSuites';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ChakraProvider } from '@chakra-ui/react';
import { TestSuite } from '../../models/types';

jest.mock('../../hooks/useTestSuites');
jest.mock('../../hooks/useErrorHandler');
jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

const mockTestSuites: TestSuite[] = [
  {
    id: '1',
    name: 'Test Suite 1',
    description: 'Description 1',
    projectId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Test Suite 2',
    description: 'Description 2',
    projectId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('TestSuiteList', () => {
  beforeEach(() => {
    (useErrorHandler as jest.Mock).mockReturnValue({ handleError: jest.fn() });
  });

  it('renders loading state', () => {
    (useTestSuites as jest.Mock).mockReturnValue({
      isLoading: true,
      data: null,
      isError: false,
    });
    render(
      <ChakraProvider>
        <TestSuiteList
          projectId="1"
          testSuites={[]}
          onSort={(newSortBy: string, newSortOrder: string) => {}}
          sortBy="name"
          sortOrder="asc"
        />
      </ChakraProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useTestSuites as jest.Mock).mockReturnValue({
      isLoading: false,
      data: null,
      isError: true,
    });
    render(
      <ChakraProvider>
        <TestSuiteList
          projectId="1"
          testSuites={[]}
          onSort={() => {}}
          sortBy="name"
          sortOrder="asc"
        />
      </ChakraProvider>
    );
    expect(screen.getByText('Error loading test suites')).toBeInTheDocument();
  });

  it('renders test suites', () => {
    (useTestSuites as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { testSuites: mockTestSuites, total: 2 },
      isError: false,
    });
    render(
      <ChakraProvider>
        <TestSuiteList
          projectId="1"
          testSuites={mockTestSuites}
          onSort={() => {}}
          sortBy="name"
          sortOrder="asc"
        />
      </ChakraProvider>
    );
    expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    expect(screen.getByText('Test Suite 2')).toBeInTheDocument();
  });

  it('renders pagination', () => {
    (useTestSuites as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { testSuites: mockTestSuites, total: 15 },
      isError: false,
    });
    render(
      <ChakraProvider>
        <TestSuiteList
          projectId="1"
          testSuites={mockTestSuites}
          onSort={() => {}}
          sortBy="name"
          sortOrder="asc"
        />
      </ChakraProvider>
    );
    expect(screen.getByText('1')).toBeInTheDocument(); // Current page
    expect(screen.getByText('2')).toBeInTheDocument(); // Next page
  });

  it('renders create new test suite button', () => {
    (useTestSuites as jest.Mock).mockReturnValue({
      isLoading: false,
      data: { testSuites: mockTestSuites, total: 2 },
      isError: false,
    });
    render(
      <ChakraProvider>
        <TestSuiteList
          projectId="1"
          testSuites={mockTestSuites}
          onSort={() => {}}
          sortBy="name"
          sortOrder="asc"
        />
      </ChakraProvider>
    );
    expect(screen.getByText('Create New Test Suite')).toBeInTheDocument();
  });

  it('renders test suites correctly', () => {
    // TODO: Implement this test when TestSuiteList component is created
    // const mockTestSuites = [
    //   { id: '1', name: 'Test Suite 1' },
    //   { id: '2', name: 'Test Suite 2' },
    // ];
    // render(<TestSuiteList testSuites={mockTestSuites} />);
    // expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    // expect(screen.getByText('Test Suite 2')).toBeInTheDocument();
  });

  it('displays a message when there are no test suites', () => {
    render(
      <ChakraProvider>
        <TestSuiteList
          projectId="1"
          testSuites={[]}
          onSort={jest.fn()}
          sortBy="name"
          sortOrder="asc"
        />
      </ChakraProvider>
    );

    expect(screen.getByText('No test suites found')).toBeInTheDocument();
  });

  it('allows adding a new test suite', () => {
    // TODO: Implement this test when add functionality is created
    // render(<TestSuiteList testSuites={[]} />);
    // const addButton = screen.getByText('Add Test Suite');
    // fireEvent.click(addButton);
    // expect(screen.getByText('Create New Test Suite')).toBeInTheDocument();
  });
});
