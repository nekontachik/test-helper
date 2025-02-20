import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { logger } from '@/lib/utils/logger';

interface FormHookConfig<T extends z.ZodType> {
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void>;
  defaultValues?: Partial<z.infer<T>>;
}

export function createFormHook<T extends z.ZodType>({ 
  schema, 
  onSubmit,
  defaultValues 
}: FormHookConfig<T>) {
  return (formProps: Partial<UseFormProps<z.infer<T>>> = {}) => {
    const form = useForm<z.infer<T>>({
      resolver: zodResolver(schema),
      defaultValues,
      ...formProps
    });

    const handleSubmit = async (data: z.infer<T>) => {
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