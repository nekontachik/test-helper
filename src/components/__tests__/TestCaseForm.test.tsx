import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { TestCaseForm } from '../TestCaseForm';
import { TestCaseStatus, TestCasePriority } from '@/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/hooks/useTestCaseMutations');

const mockTestCase = {
  id: '1',
  title: 'Initial Test Case',
  description: 'Initial Description',
  steps: 'Step 1\nStep 2',
  expectedResult: 'Initial Expected Result',
  actualResult: 'Initial Actual Result',
  status: TestCaseStatus.DRAFT,
  priority: TestCasePriority.MEDIUM,
  projectId: 'project-1',
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TestCaseForm', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  const renderComponent = (props = {}): ReturnType<typeof render> => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <TestCaseForm
            projectId="project-1"
            {...props}
          />
        </ChakraProvider>
      </QueryClientProvider>
    );
  };

  it('renders correctly with test case data', () => {
    renderComponent({ testCase: mockTestCase });

    expect(screen.getByLabelText(/title/i)).toHaveValue('Initial Test Case');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Initial Description');
    expect(screen.getByLabelText(/steps/i)).toHaveValue('Step 1\nStep 2');
    expect(screen.getByLabelText(/expected result/i)).toHaveValue('Initial Expected Result');
    expect(screen.getByLabelText(/actual result/i)).toHaveValue('Initial Actual Result');
    expect(screen.getByLabelText(/status/i)).toHaveValue(TestCaseStatus.DRAFT);
    expect(screen.getByLabelText(/priority/i)).toHaveValue(TestCasePriority.MEDIUM);
  });

  it('handles create submission correctly', async () => {
    const mockOnSubmit = jest.fn();
    renderComponent({ onSubmit: mockOnSubmit });

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Test Case' }
    });
    fireEvent.change(screen.getByLabelText(/steps/i), {
      target: { value: 'New Steps' }
    });
    fireEvent.change(screen.getByLabelText(/expected result/i), {
      target: { value: 'New Expected Result' }
    });

    fireEvent.click(screen.getByText(/create test case/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Test Case',
        steps: 'New Steps',
        expectedResult: 'New Expected Result',
        status: TestCaseStatus.DRAFT,
        priority: TestCasePriority.MEDIUM,
        projectId: 'project-1',
        description: '',
        actualResult: ''
      });
    });
  });

  it('handles update submission correctly', async () => {
    const mockUpdateMutate = jest.fn();
    renderComponent({ testCase: mockTestCase, onSubmit: mockUpdateMutate });

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Updated Test Case' }
    });

    fireEvent.click(screen.getByText(/update test case/i));

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: '1',
        data: {
          ...mockTestCase,
          title: 'Updated Test Case'
        }
      });
    });
  });

  it('shows validation errors', async () => {
    renderComponent();
    fireEvent.click(screen.getByText(/create test case/i));

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/steps are required/i)).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/expected result is required/i)).toBeInTheDocument();
    });
  });

  it('handles loading state correctly', () => {
    renderComponent({ isLoading: true });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create test case/i })).toBeDisabled();
  });
}); 