import React from 'react';
import { Toast } from '../components/Toast';

export function useErrorToast() {
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const ErrorComponent = React.useMemo(() => {
    return error ? (
      <Toast message={error} type="error" onClose={() => setError(null)} />
    ) : null;
  }, [error]);

  const ToastComponent = React.useMemo(() => {
    return toast ? (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    ) : null;
  }, [toast]);

  return { setError, ErrorComponent, setToast, ToastComponent };
}
