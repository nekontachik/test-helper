'use client';

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { useEffect } from 'react';
import type { FormValues } from './types';
import { verifySchema } from './types';

interface VerificationFormProps {
  onSubmit: SubmitHandler<FormValues>;
  isSubmitting: boolean;
  retryAfter: number | null;
  status: string;
}

export function VerificationForm({ 
  onSubmit, 
  isSubmitting, 
  retryAfter,
  status
}: VerificationFormProps): JSX.Element {
  const form = useForm<FormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    if (status === 'initial') {
      form.reset();
    }
  }, [status, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input 
                {...field} 
                placeholder="Enter 6-digit code" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                maxLength={6} 
                aria-label="Two-factor authentication code" 
                autoComplete="one-time-code" 
                disabled={isSubmitting || !!retryAfter}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button 
        type="submit" 
        className="w-full mt-4" 
        disabled={isSubmitting || !!retryAfter}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner className="mr-2" aria-hidden="true" />
            Verifying...
          </>
        ) : retryAfter ? (
          `Try again in ${retryAfter}s`
        ) : (
          'Verify and Enable'
        )}
      </Button>
    </form>
  );
} 