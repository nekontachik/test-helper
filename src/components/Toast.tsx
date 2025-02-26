import React from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps): JSX.Element {
  const bgColor =
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
        ? 'bg-red-500'
        : 'bg-blue-500';

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg`}
      role="alert"
    >
      {message}
      <button onClick={onClose} className="ml-2 font-bold" aria-label="Close">
        &times;
      </button>
    </div>
  );
}
