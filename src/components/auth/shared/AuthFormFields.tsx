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
  type: 'signin' | 'signup' | 'reset';
}

export const AuthFormFields = memo(function AuthFormFields({ 
  _form,
  isLoading,
  type
}: AuthFieldProps) {
  // Set appropriate autocomplete attribute based on form type
  const getPasswordAutocomplete = (): string => {
    if (type === 'signin') return 'current-password';
    return 'new-password';
  };

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
                <Input {...field} disabled={isLoading} autoComplete="name" />
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
              <Input type="email" {...field} disabled={isLoading} autoComplete="username" />
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
              <Input 
                type="password" 
                {...field} 
                autoComplete={getPasswordAutocomplete()} 
                disabled={isLoading} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}); 