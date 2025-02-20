'use client';

import * as React from 'react';
import { 
  useFormContext, 
  FormProvider, 
  UseFormReturn, 
  FieldValues, 
  Path, 
  Controller, 
  ControllerFieldState,
  ControllerRenderProps,
  Control
} from 'react-hook-form';
import { cn } from '@/lib/utils';

interface FormProps<TFormValues extends FieldValues> {
  form: UseFormReturn<TFormValues>;
  onSubmit: (data: TFormValues) => void | Promise<void>;
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

interface FormFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  render: (props: {
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
    fieldState: ControllerFieldState;
  }) => React.ReactElement;
}

const FormField = <TFieldValues extends FieldValues>({ 
  name, 
  control, 
  render 
}: FormFieldProps<TFieldValues>) => {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller<TFieldValues>
        name={name}
        control={control}
        render={({ field, fieldState }) => render({ field, fieldState })}
      />
    </FormFieldContext.Provider>
  );
};

FormField.displayName = 'FormField';

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const form = useFormContext();

  if (!form) {
    throw new Error('useFormField must be used within a Form');
  }

  if (!fieldContext) {
    throw new Error('useFormField must be used within a FormField');
  }

  if (!itemContext) {
    throw new Error('useFormField must be used within a FormItem');
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
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <div
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? formDescriptionId
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
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
  type FormFieldProps,
};