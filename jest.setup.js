import '@testing-library/jest-dom';
import { server } from './tests/mocks/server';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
  }),
}));

// Mock Chakra UI's useToast hook
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    __esModule: true,
    ...originalModule,
    useToast: jest.fn(() => jest.fn()),
  };
});

require('jest-fetch-mock').enableMocks()

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
