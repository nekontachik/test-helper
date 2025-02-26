import { renderHook, act } from '@testing-library/react';
import { createFormHook } from '../createFormHook';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
}));

const testSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

describe('createFormHook', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should handle successful form submission', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    const { result } = renderHook(
      () => createFormHook({
        schema: testSchema,
        onSubmit: mockOnSubmit,
        defaultValues: { name: '', email: '' }
      })(),
      { wrapper }
    );

    await act(async () => {
      result.current.form.setValue('name', 'Test User');
      result.current.form.setValue('email', 'test@example.com');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com'
    });
    expect(toast.success).toHaveBeenCalledWith('Successfully saved');
  });

  it('should handle validation errors', async () => {
    const { result } = renderHook(
      () => createFormHook({
        schema: testSchema,
        onSubmit: mockOnSubmit
      })(),
      { wrapper }
    );

    await act(async () => {
      result.current.form.setValue('email', 'invalid-email');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(result.current.form.formState.errors.email).toBeDefined();
    expect(result.current.form.formState.errors.name).toBeDefined();
  });

  it('should handle submission errors', async () => {
    const error = new Error('Submission failed');
    mockOnSubmit.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => createFormHook({
        schema: testSchema,
        onSubmit: mockOnSubmit,
        defaultValues: { name: 'Test', email: 'test@example.com' }
      })(),
      { wrapper }
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Submission failed');
  });
}); 