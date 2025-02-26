import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TestCase } from '@/types';
import { TestCaseResultStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileUploadField } from './FileUploadField';
import { CardContent } from '@/components/ui/card';
import type { TestResultFormData } from '@/lib/validations/testResult';
import { testResultSchema } from '@/lib/validations/testResult';

interface TestCaseFormProps {
  projectId: string;
  testCase: TestCase;
  onSubmit: (data: TestResultFormData) => Promise<void>;
  isSubmitting: boolean;
  isLastCase: boolean;
  onCancel: () => void;
}

export function TestCaseForm({ projectId, testCase, onSubmit, isSubmitting, isLastCase, onCancel }: TestCaseFormProps): JSX.Element {
  const form = useForm<TestResultFormData>({
    resolver: zodResolver(testResultSchema),
    defaultValues: {
      testCaseId: testCase.id,
      status: TestCaseResultStatus.PASSED,
      notes: '',
      evidence: [],
    },
  });

  return (
    <CardContent className="space-y-4">
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold">{testCase.title}</h3>
        <p className="mt-2 text-muted-foreground">{testCase.description}</p>
        <div className="mt-4">
          <h4 className="font-medium">Steps:</h4>
          <pre className="mt-1 whitespace-pre-wrap">{testCase.steps}</pre>
        </div>
        <div className="mt-4">
          <h4 className="font-medium">Expected Result:</h4>
          <p className="mt-1">{testCase.expectedResult}</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select 
              onValueChange={(value: TestCaseResultStatus) => form.setValue('status', value)}
              value={form.watch('status')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TestCaseResultStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              {...form.register('notes')}
              placeholder="Add test notes..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Evidence</label>
            <FileUploadField 
              form={form} 
              projectId={projectId}
              files={form.watch('evidence') || []}
              onFilesChange={(files) => form.setValue('evidence', files)}
              isDisabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isLastCase ? 'Complete Test Run' : 'Next Test Case'}
          </Button>
        </div>
      </form>
    </CardContent>
  );
} 