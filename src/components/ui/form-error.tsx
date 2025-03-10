import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FiAlertCircle, FiXCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface FormErrorProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  className?: string;
  showIcon?: boolean;
  errors?: Array<{ path: string; message: string }>;
}

/**
 * A component for displaying form errors with different severity levels
 */
export function FormError({
  title,
  message,
  severity = 'error',
  className,
  showIcon = true,
  errors
}: FormErrorProps): JSX.Element {
  const getIcon = (): JSX.Element => {
    switch (severity) {
      case 'error':
        return <FiXCircle className="h-4 w-4" />;
      case 'warning':
        return <FiAlertTriangle className="h-4 w-4" />;
      case 'info':
        return <FiInfo className="h-4 w-4" />;
      default:
        return <FiAlertCircle className="h-4 w-4" />;
    }
  };

  const getVariant = (): 'destructive' | 'default' => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
      case 'info':
      default:
        return 'default';
    }
  };

  return (
    <Alert 
      variant={getVariant()} 
      className={cn('mb-4', className)}
    >
      {showIcon && getIcon()}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>
        <p>{message}</p>
        {errors && errors.length > 0 && (
          <ul className="mt-2 text-sm list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index}>
                <strong>{error.path}:</strong> {error.message}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
} 