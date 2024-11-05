import { pwnedPassword } from 'hibp';
import zxcvbn from 'zxcvbn';

export interface PasswordStrength {
  score: number;
  feedback: {
    warning?: string;
    suggestions: string[];
  };
  isStrong: boolean;
}

export class PasswordValidationService {
  static async validatePassword(password: string, email: string): Promise<PasswordStrength> {
    // Check if password has been breached
    const timesBreached = await pwnedPassword(password);
    if (timesBreached > 0) {
      return {
        score: 0,
        feedback: {
          warning: 'This password has been exposed in data breaches',
          suggestions: ['Please choose a different password'],
        },
        isStrong: false,
      };
    }

    // Use zxcvbn for comprehensive password strength analysis
    const result = zxcvbn(password, [email]);

    // Convert zxcvbn result to our format
    return {
      score: result.score,
      feedback: {
        warning: result.feedback.warning || undefined,
        suggestions: result.feedback.suggestions,
      },
      isStrong: result.score >= 3, // Require at least 3/4 score
    };
  }

  static getPasswordRequirements(): string[] {
    return [
      'At least 8 characters long',
      'Contains at least one uppercase letter',
      'Contains at least one lowercase letter',
      'Contains at least one number',
      'Contains at least one special character',
      'Not commonly used or easily guessable',
      'Not previously exposed in data breaches',
    ];
  }
} 