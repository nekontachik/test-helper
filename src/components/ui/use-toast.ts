import { useState, useCallback } from 'react';

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
  variant?: 'default' | 'destructive';
}

type ToastOptions = Omit<ToastProps, 'id'>;

export function useToast(): {
  toasts: ToastProps[];
  toast: (options: ToastOptions) => ToastProps;
  dismiss: (id: string) => void;
} {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    const toast = { ...options, id };
    
    setToasts((prevToasts) => [...prevToasts, toast]);

    if (options.duration !== Infinity) {
      setTimeout(() => {
        setToasts((prevToasts) => 
          prevToasts.filter((t) => t.id !== toast.id)
        );
      }, options.duration || 5000);
    }

    return toast;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    toast: addToast,
    dismiss: dismissToast,
  };
} 