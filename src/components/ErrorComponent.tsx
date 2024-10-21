import React from 'react';

interface ErrorComponentProps {
  message?: string;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({
  message = 'An error occurred',
}) => {
  return (
    <div className="error-container">
      <h2>Error</h2>
      <p>{message}</p>
    </div>
  );
};

export default ErrorComponent;
