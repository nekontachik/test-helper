# Testing Guide for Testing Buddy Project

## General Testing Principles

- Use `@testing-library/react` for all React component and hook tests.
- Do not use `@testing-library/react-hooks` as it's not compatible with React 18+.
- Always use `.tsx` extension for test files that include JSX.

## Testing Components

- Import from '@testing-library/react'
- Use `render`, `screen`, `fireEvent`, `waitFor`, etc.
- Example:

  ```typescript
  import { render, screen, fireEvent } from '@testing-library/react';

  test('component test', () => {
    render(<MyComponent />);
    // ... test logic
  });
  ```

## Testing Hooks

- Create a test component that uses the hook
- Render the test component and test its behavior
- Example:

  ```typescript
  import { render, act } from '@testing-library/react';

  const TestComponent = () => {
    const hookResult = useMyHook();
    return <div>{/* Use hook result */}</div>;
  };

  test('hook test', () => {
    const { result } = render(<TestComponent />);
    act(() => {
      // Interact with the rendered component
    });
    // Assert on the rendered output
  });
  ```

## API Route Testing

- Use `node-mocks-http` to create mock requests and responses
- Add the `env` property to mocked requests
- Example:

  ```typescript
  import { createMocks } from 'node-mocks-http';

  const { req, res } = createMocks({
    method: 'GET',
    query: {
      /* query params */
    },
  });
  (req as any).env = {}; // Add env property
  ```

## Mocking

- Mock external dependencies like Prisma
- Use `jest.mock()` at the top of test files
- Example:
  ```typescript
  jest.mock('../../../../../lib/prisma', () => ({
    testCase: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  }));
  ```

## Asynchronous Testing

- Use `waitFor` from `@testing-library/react` for asynchronous tests
- Wrap asynchronous operations in `act()`

## Error Handling

- Test both success and error scenarios
- Use `try/catch` blocks in API routes and test both cases

## Type Safety

- Use TypeScript for all tests
- Ensure proper typing for mock data and function parameters

Remember to update this guide as new patterns or best practices are established in the project.
