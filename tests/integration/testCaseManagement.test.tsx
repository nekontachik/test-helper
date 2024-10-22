import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { TestCaseList } from '@/components/TestCaseList';
import { TestCaseDetails } from '@/components/TestCaseDetails';
import { EditTestCaseForm } from '@/components/EditTestCaseForm';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

// Setup Mock Service Worker
const server = setupServer(
  http.get('/api/projects/:projectId/test-cases', () => {
    return HttpResponse.json({
      items: [
        { id: '1', title: 'Test Case 1', status: TestCaseStatus.ACTIVE, priority: TestCasePriority.HIGH },
        { id: '2', title: 'Test Case 2', status: TestCaseStatus.INACTIVE, priority: TestCasePriority.LOW },
      ],
      totalPages: 1,
      currentPage: 1,
    });
  }),
  http.post('/api/projects/:projectId/test-cases', async ({ request }) => {
    const body = await request.json() as Partial<TestCase>;
    return HttpResponse.json({ id: '3', ...body }, { status: 201 });
  }),
  http.get('/api/projects/:projectId/test-cases/:testCaseId', ({ params }) => {
    return HttpResponse.json({ 
      id: params.testCaseId, 
      title: 'Test Case', 
      description: 'Description', 
      status: TestCaseStatus.ACTIVE, 
      priority: TestCasePriority.HIGH 
    });
  }),
  http.put('/api/projects/:projectId/test-cases/:testCaseId', async ({ params, request }) => {
    const body = await request.json() as Partial<TestCase>;
    return HttpResponse.json({ id: params.testCaseId, ...body });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Test Case Management Integration', () => {
  it('lists test cases and allows creation of a new test case', async () => {
    render(<TestCaseList projectId="project1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Case 1')).toBeInTheDocument();
      expect(screen.getByText('Test Case 2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create Test Case'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Test Case' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('Test case created')).toBeInTheDocument();
    });
  });

  it('displays test case details and allows editing', async () => {
    const mockTestCase: TestCase = {
      id: '1',
      title: 'Test Case',
      description: 'Description',
      steps: 'Steps',
      expectedResult: 'Expected Result',
      actualResult: 'Actual Result',
      status: TestCaseStatus.ACTIVE,
      priority: TestCasePriority.HIGH,
      projectId: 'project1',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };

    render(<TestCaseDetails testCase={mockTestCase} projectId="project1" />);

    expect(screen.getByText('Test Case')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Edit Test Case'));

    render(<EditTestCaseForm testCase={mockTestCase} onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByDisplayValue('Test Case'), { target: { value: 'Updated Test Case' } });
    fireEvent.click(screen.getByText('Update Test Case'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Updated Test Case')).toBeInTheDocument();
    });
  });
});
