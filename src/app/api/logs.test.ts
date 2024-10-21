import { createMocks } from 'node-mocks-http';
import handler from './logs';

describe('/api/logs', () => {
  it('should return 200 for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        logs: expect.any(Array),
      })
    );
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(405);
  });
});
