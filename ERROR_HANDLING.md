# Error Handling System

This document outlines the comprehensive error handling system implemented in the application.

## Components

### 1. Global Error Boundary

The `GlobalErrorBoundary` component (`src/components/error-boundary/GlobalErrorBoundary.tsx`) provides a React error boundary that catches errors in the component tree and displays user-friendly error messages. It includes:

- Error code extraction and categorization
- User-friendly error messages based on error codes
- Technical details for developers in development mode
- Error logging to the server
- Recovery options (refresh, go back, go home)

### 2. API Error Handler

The API error handler (`src/lib/api/errorHandler.ts`) provides utilities for handling API errors and returning appropriate responses. It includes:

- Error code mapping for different types of errors
- User-friendly error messages based on error codes
- Handling of validation errors from Zod
- Handling of database errors from Prisma
- Consistent error response format

### 3. Error Toast Utility

The error toast utility (`src/lib/utils/errorToast.ts`) provides functions for displaying error messages in toasts. It includes:

- User-friendly error messages based on error codes
- Handling of validation errors with field-specific messages
- API response error handling

### 4. Form Error Component

The form error component (`src/components/ui/form-error.tsx`) provides a reusable component for displaying form errors. It includes:

- Different severity levels (error, warning, info)
- Field-specific error messages
- Customizable appearance

### 5. API Error Hook

The API error hook (`src/hooks/useApiError.ts`) provides a custom hook for handling API errors in forms. It includes:

- Error state management
- Field-specific error handling
- API response error handling

### 6. Error Pages

The application includes enhanced error pages:

- App error page (`src/app/error.tsx`) for handling runtime errors
- Not found page (`src/app/not-found.tsx`) for handling 404 errors

## Error Codes

The system uses the following error codes:

- `NOT_FOUND`: The requested resource could not be found
- `UNAUTHORIZED`: The user does not have permission to access the resource
- `FORBIDDEN`: Access to the resource is forbidden
- `VALIDATION_ERROR`: The data provided is invalid
- `NETWORK_ERROR`: There was a problem connecting to the server
- `SERVER_ERROR`: The server encountered an error
- `CONFLICT`: The request conflicts with the current state of the resource
- `BAD_REQUEST`: The request was invalid
- `RATE_LIMIT_EXCEEDED`: The user has exceeded the rate limit

## Usage

### Global Error Boundary

The global error boundary is integrated into the application's provider tree:

```tsx
// src/components/providers/Providers.tsx
export function Providers({ children }: ProvidersProps): JSX.Element {
  return (
    <ChakraProvider theme={theme} resetCSS={false}>
      <NoFlash />
      <SupabaseAuthProvider>
        <GlobalErrorBoundary>
          {children}
        </GlobalErrorBoundary>
      </SupabaseAuthProvider>
    </ChakraProvider>
  );
}
```

### API Error Handler

The API error handler is used in API routes:

```tsx
// Example API route
export async function POST(req: Request) {
  try {
    // API logic
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Form Error Component

The form error component can be used in forms:

```tsx
// Example form
<form>
  <FormError 
    message="Please fix the following errors"
    errors={validationErrors}
    severity="error"
  />
  {/* Form fields */}
</form>
```

### API Error Hook

The API error hook can be used in form components:

```tsx
// Example form component
function MyForm() {
  const { error, setApiError, clearError, handleApiResponseError } = useApiError();
  
  const handleSubmit = async (data) => {
    try {
      const response = await fetch('/api/resource', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        await handleApiResponseError(response);
        return;
      }
      
      // Success handling
    } catch (error) {
      setApiError(error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error.hasError && (
        <FormError message={error.message} errors={error.fieldErrors} />
      )}
      {/* Form fields */}
    </form>
  );
}
```

## Best Practices

1. Always use the error handling utilities provided by the system
2. Provide user-friendly error messages
3. Log errors to the server for debugging
4. Handle field-specific validation errors
5. Provide recovery options for users
6. Show technical details only in development mode 