'use client';

export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 100,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
} as const;

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

export interface PasswordCheck {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: PasswordStrength;
  checks: PasswordCheck;
}

export function checkPasswordStrength(password: string): PasswordCheck {
  return {
    hasMinLength: password.length >= PASSWORD_RULES.minLength,
    hasUpperCase: (password.match(/[A-Z]/g) || []).length >= PASSWORD_RULES.minUppercase,
    hasLowerCase: (password.match(/[a-z]/g) || []).length >= PASSWORD_RULES.minLowercase,
    hasNumber: (password.match(/[0-9]/g) || []).length >= PASSWORD_RULES.minNumbers,
    hasSpecialChar: (password.match(/[^A-Za-z0-9]/g) || []).length >= PASSWORD_RULES.minSymbols,
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const checks = checkPasswordStrength(password);

  // Check length
  if (!checks.hasMinLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters long`);
  }
  if (password.length > PASSWORD_RULES.maxLength) {
    errors.push(`Password must be less than ${PASSWORD_RULES.maxLength} characters`);
  }

  // Check other requirements
  if (!checks.hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!checks.hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!checks.hasNumber) {
    errors.push('Password must contain at least one number');
  }
  if (!checks.hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  const passedChecks = Object.values(checks).filter(Boolean).length;
  let strength: PasswordStrength = 'weak';

  if (passedChecks === 5) {
    strength = 'very-strong';
  } else if (passedChecks === 4) {
    strength = 'strong';
  } else if (passedChecks === 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    checks,
  };
}

export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'very-strong':
      return 'bg-emerald-500';
    case 'strong':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'weak':
      return 'bg-red-500';
    default:
      return 'bg-gray-200';
  }
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

export function getPasswordStrength(checks: PasswordCheck): PasswordStrength {
  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  if (passedChecks <= 2) return 'weak';
  if (passedChecks === 3) return 'medium';
  if (passedChecks === 4) return 'strong';
  return 'very-strong';
} 