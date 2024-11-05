# Middleware Implementation Guide

## Structure
```
src/middleware/
├── index.ts           # Main entry point
├── types/            # TypeScript types
├── core/             # Core middleware
│   ├── auth.ts       # Authentication
│   ├── error.ts      # Error handling
│   └── logger.ts     # Logging
├── security/         # Security middleware
│   ├── rateLimit.ts  # Rate limiting
│   ├── cors.ts       # CORS handling
│   └── csrf.ts       # CSRF protection
└── utils/            # Utility middleware
    ├── validator.ts  # Request validation
    └── transform.ts  # Response transformation
```

## Core Features

### Authentication Middleware
```typescript
export async function authenticate(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
) {
  try {
    const token = extractToken(req);
    const user = await verifyToken(token);
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
```

### Rate Limiting
```typescript
export function rateLimit({
  windowMs = 60 * 1000,
  max = 100,
}: RateLimitOptions) {
  const limiter = createRateLimiter({ windowMs, max });
  
  return async function rateLimitMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: NextFunction
  ) {
    try {
      await limiter.check(req, max);
      return next();
    } catch {
      return res.status(429).json({ error: 'Too Many Requests' });
    }
  };
}
```

## Implementation Guidelines

### 1. Core Principles
- Request/Response pipeline
- Error handling
- Type safety
- Performance optimization
- Composability

### 2. Error Handling
```typescript
export function errorHandler(
  error: Error,
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
) {
  logger.error(error);
  
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details,
    });
  }
  
  return res.status(500).json({
    error: 'Internal Server Error',
  });
}
```

### 3. Logging
```typescript
export function requestLogger(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
    });
  });
  
  return next();
}
```

## Security Features

### CORS Configuration
```typescript
export function corsMiddleware(options: CorsOptions) {
  return function(
    req: NextApiRequest,
    res: NextApiResponse,
    next: NextFunction
  ) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', options.origin);
    res.setHeader('Access-Control-Allow-Methods', options.methods);
    res.setHeader('Access-Control-Allow-Headers', options.headers);
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    return next();
  };
}
```

### CSRF Protection
```typescript
export function csrfProtection(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
) {
  if (!validateCsrfToken(req)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  return next();
}
```

## Performance Optimization

### Caching
```typescript
export function cacheMiddleware(options: CacheOptions) {
  return async function(
    req: NextApiRequest,
    res: NextApiResponse,
    next: NextFunction
  ) {
    const cacheKey = generateCacheKey(req);
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }
    
    res.originalJson = res.json;
    res.json = (body) => {
      cache.set(cacheKey, body, options.ttl);
      return res.originalJson(body);
    };
    
    return next();
  };
}
```

### Compression
```typescript
export function compressionMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
) {
  // Implement compression logic
  return next();
}
```

## Testing

### Unit Tests
```typescript
describe('Authentication Middleware', () => {
  it('should authenticate valid token', async () => {
    const req = mockRequest({ headers: { authorization: 'valid-token' }});
    const res = mockResponse();
    const next = jest.fn();
    
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('Middleware Chain', () => {
  it('should process request through all middleware', async () => {
    const req = mockRequest();
    const res = mockResponse();
    
    await processMiddlewareChain([
      authenticate,
      rateLimit(),
      requestLogger,
    ])(req, res);
    
    expect(res.statusCode).toBe(200);
  });
});
```

## Best Practices

### Middleware Composition
```typescript
export function composeMiddleware(
  ...middleware: Middleware[]
): Middleware {
  return function(req, res, next) {
    return middleware.reduceRight(
      (acc, mid) => () => mid(req, res, acc),
      next
    )();
  };
}
```

### Type Safety
```typescript
type Middleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
) => Promise<void> | void;

interface MiddlewareOptions {
  // Configuration options
}
```

### Error Handling
```typescript
export function withErrorHandling(middleware: Middleware): Middleware {
  return async function(req, res, next) {
    try {
      await middleware(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
```

## Documentation

### JSDoc Comments
```typescript
/**
 * Rate limiting middleware
 * @param {RateLimitOptions} options - Configuration options
 * @returns {Middleware} Rate limiting middleware function
 */
```

### Usage Examples
```typescript
// Basic usage
app.use(authenticate);

// With options
app.use(rateLimit({ windowMs: 60000, max: 100 }));

// Composed middleware
app.use(composeMiddleware(
  requestLogger,
  authenticate,
  rateLimit()
));
```

## Monitoring

### Performance Metrics
```typescript
export function metricsMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
) {
  const start = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    metrics.recordRequestDuration(duration);
  });
  
  return next();
}
```

### Health Checks
```typescript
export function healthCheck(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
```

## Security

### Input Validation
```typescript
export function validateRequest(schema: Schema) {
  return function(req: NextApiRequest, res: NextApiResponse, next: NextFunction) {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details });
    }
    return next();
  };
}
```

### Response Headers
```typescript
export function securityHeaders(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
) {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  return next();
}
```
