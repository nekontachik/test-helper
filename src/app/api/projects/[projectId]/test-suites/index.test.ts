import { createMocks } from 'node-mocks-http';
import testSuitesHandler from './index';

describe('Test Suites API', () => {
  it('should get test suites', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { projectId: '1' },
    });

    await testSuitesHandler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        success: true,
        data: expect.any(Object),
      })
    );
  });

  // Add more tests as needed
});
