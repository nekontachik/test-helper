import * as Yup from 'yup';
import { TestCasePriority, TestCaseStatus, TestRunStatus } from '@/types';

export const projectSchema = Yup.object().shape({
  name: Yup.string().required('Project name is required'),
  description: Yup.string(),
});

export const testCaseSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  expectedResult: Yup.string(),
  priority: Yup.mixed<TestCasePriority>().oneOf(Object.values(TestCasePriority)),
  status: Yup.mixed<TestCaseStatus>().oneOf(Object.values(TestCaseStatus)),
  projectId: Yup.string().required('Project ID is required'),
});

export const testRunSchema = Yup.object().shape({
  name: Yup.string().required('Test run name is required'),
  testCaseIds: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one test case must be selected'),
  projectId: Yup.string().required('Project ID is required'),
  status: Yup.mixed()
    .oneOf(Object.values(TestRunStatus))
    .required('Status is required'),
});

export const testSuiteSchema = Yup.object().shape({
  name: Yup.string().required('Test suite name is required'),
  description: Yup.string(),
});

export const validateSchema = (
  schema: Yup.AnyObjectSchema,
  data: unknown
): { isValid: boolean; errors: string[] | null } => {
  try {
    schema.validateSync(data, { abortEarly: false });
    return { isValid: true, errors: null };
  } catch (error: unknown) {
    if (error instanceof Yup.ValidationError) {
      return { isValid: false, errors: error.errors };
    }
    if (error instanceof Error) {
      return { isValid: false, errors: [error.message] };
    }
    return { isValid: false, errors: ['An unknown error occurred'] };
  }
};

export const validateTestCase = (data: unknown): { isValid: boolean; errors: string[] | null } =>
  validateSchema(testCaseSchema, data);
export const validateTestRun = (data: unknown): { isValid: boolean; errors: string[] | null } =>
  validateSchema(testRunSchema, data);
export const validateProject = (data: unknown): { isValid: boolean; errors: string[] | null } =>
  validateSchema(projectSchema, data);
export const validateTestSuite = (data: unknown): { isValid: boolean; errors: string[] | null } =>
  validateSchema(testSuiteSchema, data);

// Add similar validation functions for other schemas if needed
