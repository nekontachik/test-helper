import { MockResizeObserver } from '../jest.setup';

describe('Component', () => {
  beforeEach(() => {
    window.ResizeObserver = MockResizeObserver;
  });

  // ... test cases ...
});

