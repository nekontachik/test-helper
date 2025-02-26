import type { UseFormProps } from 'react-hook-form';
import type { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/utils/logger';

interface FormHookConfig<T extends z.ZodType> {
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void>;
  defaultValues?: z.infer<T>;
}

export function createFormHook<T extends z.ZodType>({ 
  schema, 
  onSubmit,
  defaultValues 
}: FormHookConfig<T>) {
  return (formProps: Partial<UseFormProps<z.infer<T>>> = {}): {
    form: ReturnType<typeof useForm<z.infer<T>>>;
    handleSubmit: () => Promise<void>;
    isSubmitting: boolean;
  } => {
    const form = useForm<z.infer<T>>({
      resolver: zodResolver(schema),
      defaultValues: defaultValues as z.infer<T>,
      ...formProps
    });

    const handleSubmit = async (data: z.infer<T>): Promise<void> => {
      try {
        await onSubmit(data);
        toast.success('Successfully saved');
      } catch (error) {
        logger.error('Form submission error:', error);
        toast.error(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    return {
      form,
      handleSubmit: form.handleSubmit(handleSubmit),
      isSubmitting: form.formState.isSubmitting
    };
  };
} 