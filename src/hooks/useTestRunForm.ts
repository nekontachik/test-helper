import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TestCaseResultStatus } from '@/types';
import { useState, useCallback, useEffect } from 'react';

// Update form schema
const formSchema = z.object({
  status: z.nativeEnum(TestCaseResultStatus),
  notes: z.string().default(''),
  evidenceUrls: z.array(z.string()).default([]),
  timestamp: z.number().optional()
});

export type FormData = z.infer<typeof formSchema>;

// Add missing constant
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Add file type validation
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const;

interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: readonly string[];
}

interface FileValidationResult {
  valid: boolean;
  file?: File;
  error?: string;
}

interface FormState {
  isSubmitting: boolean;
  error: string | null;
  isDirty: boolean;
  isValid: boolean;
}

export function useTestRunForm(
  projectId: string,
  testRunId: string,
  testCaseId: string,
  initialData?: Partial<FormData>,
  options: FileValidationOptions = {}
): {
  isSubmitting: boolean;
  error: string | null;
  isDirty: boolean;
  isValid: boolean;
  form: ReturnType<typeof useForm<FormData>>;
  handleSubmit: (onSubmit: (data: FormData) => Promise<void>) => Promise<void>;
  handleFileChange: (files: File[]) => File[];
  reset: (data?: Partial<FormData>) => void;
  getValues: ReturnType<typeof useForm<FormData>>["getValues"];
  setValue: ReturnType<typeof useForm<FormData>>["setValue"];
  watch: ReturnType<typeof useForm<FormData>>["watch"];
  errors: ReturnType<typeof useForm<FormData>>["formState"]["errors"];
  clearSavedData: () => void;
  saveToStorage: (data: FormData) => void;
  loadFromStorage: () => FormData | null;
} {
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    error: null,
    isDirty: false,
    isValid: false
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: TestCaseResultStatus.PASSED,
      notes: '',
      evidenceUrls: [],
      ...initialData
    }
  });

  // Remove duplicate storageKey definition
  const getStorageKey = useCallback((id: string): string => 
    `testrun:${projectId}:${testRunId}:${id}` as const
  , [projectId, testRunId]);

  // Use it in both places
  useEffect(() => {
    const storageKey = getStorageKey(testCaseId);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const formData = formSchema.parse(JSON.parse(saved));
        form.reset(formData);
      } catch (error) {
        console.error('Invalid stored form data:', error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [projectId, testRunId, testCaseId, getStorageKey, form]);

  // Auto-save form data
  const storageKey = getStorageKey(testCaseId);

  const saveToStorage = useCallback((data: FormData): void => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, [storageKey]);

  const loadFromStorage = useCallback((): FormData | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return formSchema.parse(parsed);
    } catch (error) {
      console.error('Failed to load form data:', error);
      return null;
    }
  }, [storageKey]);

  // Update form state when form changes
  useEffect(() => {
    setFormState(prev => ({
      ...prev,
      isDirty: form.formState.isDirty,
      isValid: form.formState.isValid
    }));
  }, [form.formState]);

  // Add auto-save functionality
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (form.formState.isDirty) {
        saveToStorage(value as FormData);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, saveToStorage]);

  const handleFormError = useCallback((error: unknown): string => {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    setFormState(prev => ({ 
      ...prev, 
      error: message,
      isSubmitting: false 
    }));
    return message;
  }, []);

  const clearSavedData = useCallback((): void => {
    const storageKey = getStorageKey(testCaseId);
    localStorage.removeItem(storageKey);
  }, [getStorageKey, testCaseId]);

  const safeSubmit = useCallback(async (onSubmit: (data: FormData) => Promise<void>): Promise<void> => {
    try {
      setFormState(prev => ({ ...prev, isSubmitting: true, error: null }));
      await form.handleSubmit(onSubmit)();
      clearSavedData();
    } catch (err) {
      const message = handleFormError(err);
      throw new Error(message);
    }
  }, [form, handleFormError, clearSavedData]);

  const validateFile = useCallback((file: File): FileValidationResult => {
    const maxSize = options.maxSize ?? MAX_FILE_SIZE;
    const allowedTypes = options.allowedTypes ?? ALLOWED_FILE_TYPES;

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File ${file.name} exceeds ${maxSize / 1024 / 1024}MB`
      };
    }

    // Type-safe check for file type
    if (!allowedTypes.some(type => type === file.type)) {
      return {
        valid: false,
        error: `File ${file.name} has unsupported type ${file.type}`
      };
    }

    return { valid: true, file };
  }, [options]);

  const handleFileChange = useCallback((files: File[]): File[] => {
    const results = files.map(validateFile);
    const errors = results.filter(r => !r.valid).map(r => r.error);
    
    if (errors.length) {
      throw new Error(errors.join('\n'));
    }

    const validFiles = results.filter((r): r is FileValidationResult & { file: File } => r.valid);
    form.setValue(
      'evidenceUrls', 
      validFiles.map(r => r.file.name), 
      { shouldValidate: true }
    );
    return validFiles.map(r => r.file);
  }, [form, validateFile]);

  const resetForm = useCallback((data?: Partial<FormData>): void => {
    form.reset({ ...form.getValues(), ...data });
    if (!data) {
      clearSavedData();
    }
  }, [form, clearSavedData]);

  // Add form utilities
  return {
    ...formState,
    form,
    handleSubmit: safeSubmit,
    handleFileChange,
    reset: resetForm,
    getValues: form.getValues,
    setValue: form.setValue,
    watch: form.watch,
    errors: form.formState.errors,
    clearSavedData,
    saveToStorage,
    loadFromStorage
  };
} 