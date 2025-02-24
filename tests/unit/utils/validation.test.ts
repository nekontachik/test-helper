import { 
  createProjectSchema as projectSchema, 
  createTestCaseSchema as testCaseSchema 
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('projectSchema', () => {
    it('should validate a correct project object', () => {
      const validProject = {
        name: 'Test Project',
        description: 'This is a test project',
      };
      expect(() => projectSchema.parse(validProject)).not.toThrow();
    });

    it('should throw an error for an invalid project object', () => {
      const invalidProject = {
        name: '',
        description: 'This is a test project',
      };
      expect(() => projectSchema.parse(invalidProject)).toThrow();
    });
  });

  describe('testCaseSchema', () => {
    it('should validate a correct test case object', () => {
      const validTestCase = {
        title: 'Test Case 1',
        description: 'This is a test case',
        steps: 'Step 1: Do this\nStep 2: Do that',
        expectedResult: 'Expected result',
        priority: 'HIGH',
        status: 'ACTIVE',
      };
      expect(() => testCaseSchema.parse(validTestCase)).not.toThrow();
    });

    it('should throw an error for an invalid test case object', () => {
      const invalidTestCase = {
        title: '',
        description: 'This is a test case',
        steps: 'Step 1: Do this\nStep 2: Do that',
        expectedResult: 'Expected result',
        priority: 'INVALID',
        status: 'ACTIVE',
      };
      expect(() => testCaseSchema.parse(invalidTestCase)).toThrow();
    });
  });
});
