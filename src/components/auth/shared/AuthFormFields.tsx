'use client';

import { memo } from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { UseFormReturn } from 'react-hook-form';

interface AuthFormValues {
  email: string;
  password: string;
  name?: string;
}

interface AuthFieldProps {
  _form: UseFormReturn<AuthFormValues>;
  isLoading: boolean;
  type: 'signin' | 'signup';
}

export const AuthFormFields = memo(function AuthFormFields({ 
  _form,
  isLoading,
  type
}: AuthFieldProps) {
  return (
    <>
      {type === 'signup' && (
        <FormField
          control={_form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={_form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={_form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}); 