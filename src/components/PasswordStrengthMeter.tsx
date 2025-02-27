import { validatePassword, getPasswordStrengthColor } from '@/lib/utils/password';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps): JSX.Element {
  const { strength, errors } = validatePassword(password);
  const strengthColor = getPasswordStrengthColor(strength);

  return (
    <div className={className}>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strengthColor}`}
          style={{
            width: password ? `${(strength === 'weak' ? 33 : strength === 'medium' ? 66 : 100)}%` : '0%'
          }}
        />
      </div>
      {password && (
        <div className="mt-2 text-sm">
          <p className="text-muted-foreground capitalize">
            Password strength: <span className="font-medium">{strength}</span>
          </p>
          {errors.length > 0 && (
            <ul className="mt-1 text-red-500 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 