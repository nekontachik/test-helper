import { useState, useEffect, useCallback } from 'react';

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
  variant?: 'default' | 'destructive';
}

interface ToastOptions extends Omit<ToastProps, 'id'> {}

export function useToast() {
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