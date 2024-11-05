# React Hooks Implementation Guide

## Structure
```
src/hooks/
├── index.ts           # Hook exports
├── types/            # Type definitions
├── core/             # Core hooks
│   ├── useAsync.ts   # Async operations
│   ├── useForm.ts    # Form handling
│   └── useAuth.ts    # Authentication
├── data/             # Data hooks
│   ├── useQuery.ts   # Data fetching
│   └── useMutation.ts # Data mutations
└── ui/               # UI hooks
    ├── useModal.ts   # Modal state
    └── useToast.ts   # Toast notifications
```

## Core Features

### Base Hook Pattern
```typescript
function useHook<T>(config: HookConfig): HookResult<T> {
  // State management
  const [state, setState] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Memoized values
  const value = useMemo(() => computeValue(state), [state]);

  // Effect cleanup
  useEffect(() => {
    return () => cleanup();
  }, []);

  return { state, error, isLoading, value };
}
```

### Async Hook Pattern
```typescript
function useAsyncHook<T>(
  asyncFn: () => Promise<T>,
  deps: DependencyList = []
): AsyncHookResult<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    status: 'idle'
  });

  useEffect(() => {
    let mounted = true;

    const execute = async () => {
      setState(prev => ({ ...prev, status: 'loading' }));
      try {
        const data = await asyncFn();
        if (mounted) {
          setState({ data, error: null, status: 'success' });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: null, error, status: 'error' });
        }
      }
    };

    execute();

    return () => {
      mounted = false;
    };
  }, deps);

  return state;
}
```

## Type Definitions

### Hook Types
```typescript
interface HookConfig<T> {
  initialValue?: T;
  validate?: (value: T) => boolean;
  transform?: (value: T) => T;
}

interface HookResult<T> {
  value: T | null;
  error: Error | null;
  isLoading: boolean;
  actions: {
    setValue: (value: T) => void;
    reset: () => void;
  };
}
```

### State Types
```typescript
type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  status: AsyncStatus;
}
```

## Implementation Guidelines

### 1. State Management
```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

### 2. Effect Cleanup
```typescript
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

### 3. Event Handling
```typescript
function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element: HTMLElement | Window = window
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = (event: Event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}
```

## Testing

### Unit Tests
```typescript
describe('useHook', () => {
  it('should handle initial state', () => {
    const { result } = renderHook(() => useHook());
    expect(result.current.value).toBeNull();
    expect(result.current.isLoading).toBeFalse();
  });

  it('should handle async operations', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useAsyncHook(fetchData)
    );
    
    expect(result.current.status).toBe('loading');
    await waitForNextUpdate();
    expect(result.current.status).toBe('success');
  });
});
```

## Performance Optimization

### Memoization
```typescript
function useSearch<T>(items: T[], searchTerm: string, key: keyof T) {
  const filteredItems = useMemo(() => 
    items.filter(item => 
      String(item[key])
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ),
    [items, searchTerm, key]
  );

  return filteredItems;
}
```

### Debouncing
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## Error Handling

### Error Boundaries
```typescript
function useErrorBoundary<T>(fn: () => T) {
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(() => {
    try {
      return fn();
    } catch (e) {
      setError(e as Error);
      return null;
    }
  }, [fn]);

  return { execute, error };
}
```

## Documentation

### JSDoc Comments
```typescript
/**
 * Custom hook for managing form state
 * @template T - Form values type
 * @param {HookConfig<T>} config - Hook configuration
 * @returns {HookResult<T>} Hook result
 */
function useForm<T>(config: HookConfig<T>): HookResult<T> {
  // Implementation
}
```

## Best Practices

### 1. Naming Conventions
- Start with 'use' prefix
- Descriptive and clear names
- Consistent casing
- Action-based naming

### 2. Dependencies
- Minimize dependencies
- Use dependency arrays
- Memoize callbacks
- Handle cleanup

### 3. Type Safety
- Use generics
- Define interfaces
- Type guards
- Error types

### 4. Performance
- Memoization
- Lazy initialization
- Cleanup effects
- Avoid unnecessary renders

## Example Usage

### Basic Usage
```typescript
function Component() {
  const { data, error, isLoading } = useQuery('api/data');
  
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  
  return <Data data={data} />;
}
```

### Advanced Usage
```typescript
function Form() {
  const form = useForm({
    initialValues: { email: '' },
    validate: values => {
      // Validation logic
    },
    onSubmit: async values => {
      // Submit logic
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```
