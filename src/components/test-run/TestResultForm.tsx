import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { FileUploadField } from './FileUploadField';
import { TestCaseResultStatus } from '@/types';
import { FormSelect } from '../form/FormSelect';
import type { TestResultFormData } from '@/lib/validations/testResult';
import { testResultSchema } from '@/lib/validations/testResult';
import { useTestRunManager } from '@/hooks/useTestRunManager';
import { TestResultError } from '@/lib/errors/specific/testErrors';
import { ErrorDisplay } from '../ErrorDisplay';

const STATUS_OPTIONS = Object.values(TestCaseResultStatus).map(status => ({
  label: status,
  value: status
}));

interface TestResultFormProps {
  testRunId: string;
  projectId: string;
  testCaseId: string;
  onSuccess: (data: TestResultFormData) => Promise<void>;
  isSubmitting?: boolean;
  isLastCase?: boolean;
  onCancel?: () => void;
  onSubmit?: (data: TestResultFormData) => Promise<void>;
}

export function TestResultForm({ testRunId, projectId, testCaseId, onSuccess }: TestResultFormProps) {
  const { submitTestResult, isSubmitting } = useTestRunManager(projectId, testRunId);
  const form = useForm<TestResultFormData>({
    resolver: zodResolver(testResultSchema),
    defaultValues: {
      testCaseId,
      status: TestCaseResultStatus.PASSED,
      notes: '',
      evidenceUrls: []
    }
  });

  const onSubmit = async (data: TestResultFormData) => {
    try {
      const result = await submitTestResult(data);
      if (result) {
        onSuccess(data);
      }
    } catch (error) {
      if (error instanceof TestResultError) {
        form.setError('root', { 
          message: error.message || 'Failed to submit test result'
        });
        return;
      }
      throw error; // Let the error boundary handle unexpected errors
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormSelect<TestResultFormData>
        control={form.control}
        name="status"
        label="Status"
        options={STATUS_OPTIONS}
        disabled={isSubmitting}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <textarea
                {...field}
                disabled={isSubmitting}
                placeholder="Add any notes or observations..."
                className="w-full p-2 border rounded-md min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="evidenceUrls"
        render={({ field: { onChange, value } }) => (
          <FormItem>
            <FormLabel>Evidence</FormLabel>
            <FormControl>
              <FileUploadField 
                form={form} 
                projectId={projectId}
                files={Array.isArray(value) ? value : []}
                onFilesChange={onChange}
                isDisabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.formState.errors.root && (
        <ErrorDisplay
          message={form.formState.errors.root.message || 'Failed to submit test result'}
        />
      )}

      <div className="flex justify-end space-x-2">
        <Button 
          type="submit"
          disabled={isSubmitting || !form.formState.isValid}
          className={isSubmitting ? 'opacity-50' : ''}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Result'}
        </Button>
      </div>
    </form>
  );
} 