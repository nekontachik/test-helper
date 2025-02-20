'use client';

import * as React from 'react';
import { useFormContext, FormProvider, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface FormProps<TFormValues extends FieldValues> {
  form: UseFormReturn<TFormValues>;
  onSubmit: (data: TFormValues) => void;
  children: React.ReactNode;
  className?: string;
}

const Form = <TFormValues extends FieldValues>({ 
  form, 
  onSubmit, 
  children, 
  className 
}: FormProps<TFormValues>) => (
  <FormProvider {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn(className)}>
      {children}
    </form>
  </FormProvider>
);

interface FormFieldContextValue<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
}

const FormFieldContext = React.createContext<FormFieldContextValue<any>>({} as FormFieldContextValue<any>);

interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  render: (props: { field: ReturnType<UseFormReturn<TFieldValues>['register']> }) => React.ReactNode;
}

const FormField = <TFieldValues extends FieldValues = FieldValues>({ 
  name, 
  render 
}: FormFieldProps<TFieldValues>) => {
  const form = useFormContext<TFieldValues>();

  if (!form) {
    throw new Error('FormField must be used within a Form');
  }

  return (
    <FormFieldContext.Provider value={{ name }}>
      {render({ field: form.register(name) })}
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const form = useFormContext();

  if (!form) {
    throw new Error('useFormField must be used within a Form');
  }

  const { getFieldState, formState } = form;
  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    id: itemContext.id,
    name: fieldContext.name,
    formItemId: `${itemContext.id}-form-item`,
    formDescriptionId: `${itemContext.id}-form-item-description`,
    formMessageId: `${itemContext.id}-form-item-message`,
    ...fieldState,
  };
};

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const { formItemId } = useFormField();

  return (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <div
      ref={ref}
      id={formItemId}
      aria-describedby={
        !formDescriptionId
          ? `${formDescriptionId} ${formMessageId}`
          : formMessageId
      }
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { formMessageId } = useFormField();
  const { error } = useFormContext().getFieldState(useFormField().name);

  if (!error) return null;

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {error.message}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
  useFormField,
};