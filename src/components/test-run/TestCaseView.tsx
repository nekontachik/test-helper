import type { TestCase } from '@/types';

interface TestCaseViewProps {
  testCase: TestCase;
}

export function TestCaseView({ testCase }: TestCaseViewProps) {
  return (
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
  );
} 