export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 100,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
} as const;

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strengthScore = 0;

  // Check length
  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`);
  }
  if (password.length > PASSWORD_RULES.maxLength) {
    errors.push(`Password must be less than ${PASSWORD_RULES.maxLength} characters`);
  }

  // Check lowercase letters
  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  if (lowercaseCount < PASSWORD_RULES.minLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  strengthScore += Math.min(2, lowercaseCount);

  // Check uppercase letters
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  if (uppercaseCount < PASSWORD_RULES.minUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  strengthScore += Math.min(2, uppercaseCount);

  // Check numbers
  const numbersCount = (password.match(/[0-9]/g) || []).length;
  if (numbersCount < PASSWORD_RULES.minNumbers) {
    errors.push('Password must contain at least one number');
  }
  strengthScore += Math.min(2, numbersCount);

  // Check symbols
  const symbolsCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
  if (symbolsCount < PASSWORD_RULES.minSymbols) {
    errors.push('Password must contain at least one special character');
  }
  strengthScore += Math.min(2, symbolsCount);

  // Add length score
  strengthScore += Math.min(2, Math.floor(password.length / 8));

  let strength: PasswordValidationResult['strength'] = 'weak';
  if (strengthScore >= 8) {
    strength = 'strong';
  } else if (strengthScore >= 5) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

export function getPasswordStrengthColor(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'strong':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'weak':
      return 'bg-red-500';
    default:
      return 'bg-gray-300';
  }
} 