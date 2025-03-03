import { pwnedPassword } from 'hibp';
import zxcvbn from 'zxcvbn';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export interface PasswordStrengthResult {
  score: number;
  feedback: {
    warning?: string;
    suggestions: string[];
  };
  isStrong: boolean;
  failedPolicies: string[];
}

interface _PasswordHistory {
  id: string;
  hash: string;
}

export class PasswordPolicyService {
  static readonly MIN_LENGTH = 8;
  static readonly MAX_LENGTH = 128;
  static readonly MIN_SCORE = 3; // zxcvbn score (0-4)

  static readonly POLICIES = {
    LENGTH: 'length',
    UPPERCASE: 'uppercase',
    LOWERCASE: 'lowercase',
    NUMBER: 'number',
    SPECIAL: 'special',
    COMMON: 'common',
    BREACHED: 'breached',
    PERSONAL: 'personal',
  } as const;

  static readonly POLICY_MESSAGES: Record<keyof typeof PasswordPolicyService.POLICIES, string> = {
    LENGTH: `Password must be between ${PasswordPolicyService.MIN_LENGTH} and ${PasswordPolicyService.MAX_LENGTH} characters`,
    UPPERCASE: 'Password must contain at least one uppercase letter',
    LOWERCASE: 'Password must contain at least one lowercase letter',
    NUMBER: 'Password must contain at least one number',
    SPECIAL: 'Password must contain at least one special character',
    COMMON: 'Password is too common or easily guessable',
    BREACHED: 'Password has been exposed in data breaches',
    PERSONAL: 'Password contains personal information',
  };

  static async validatePassword(
    password: string,
    context?: { email?: string; name?: string }
  ): Promise<PasswordStrengthResult> {
    const failedPolicies: string[] = [];

    // Check basic requirements
    if (password.length < this.MIN_LENGTH || password.length > this.MAX_LENGTH) {
      failedPolicies.push(this.POLICIES.LENGTH);
    }
    if (!/[A-Z]/.test(password)) {
      failedPolicies.push(this.POLICIES.UPPERCASE);
    }
    if (!/[a-z]/.test(password)) {
      failedPolicies.push(this.POLICIES.LOWERCASE);
    }
    if (!/\d/.test(password)) {
      failedPolicies.push(this.POLICIES.NUMBER);
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      failedPolicies.push(this.POLICIES.SPECIAL);
    }

    // Check for breached passwords
    try {
      const timesBreached = await pwnedPassword(password);
      if (timesBreached > 0) {
        failedPolicies.push(this.POLICIES.BREACHED);
      }
    } catch (error) {
      console.error('Error checking breached passwords:', error);
    }

    // Use zxcvbn for comprehensive strength analysis
    const userInputs = [
      context?.email?.split('@')[0],
      context?.name,
    ].filter((input): input is string => Boolean(input));

    const result = zxcvbn(password, userInputs);

    // Check for common passwords and patterns
    if (result.score < this.MIN_SCORE) {
      failedPolicies.push(this.POLICIES.COMMON);
    }

    // Check for personal information
    if (userInputs.some(input => 
      password.toLowerCase().includes(input.toLowerCase())
    )) {
      failedPolicies.push(this.POLICIES.PERSONAL);
    }

    // Create feedback object with proper handling of the optional warning property
    const feedback = {
      suggestions: [
        ...result.feedback.suggestions,
        ...failedPolicies.map(policy => this.POLICY_MESSAGES[policy as keyof typeof this.POLICIES]),
      ],
    } as PasswordStrengthResult['feedback'];
    
    // Only add warning property if it exists
    if (result.feedback.warning) {
      feedback.warning = result.feedback.warning;
    }

    return {
      score: result.score,
      feedback,
      isStrong: failedPolicies.length === 0 && result.score >= this.MIN_SCORE,
      failedPolicies,
    };
  }

  static async validatePasswordHistory(
    userId: string,
    newPassword: string,
    maxHistory: number = 5
  ): Promise<boolean> {
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: maxHistory,
      select: { id: true, hash: true },
    });

    for (const historicPassword of passwordHistory) {
      const isMatch = await bcrypt.compare(newPassword, historicPassword.hash);
      if (isMatch) {
        return false;
      }
    }

    return true;
  }

  static async addToPasswordHistory(
    userId: string,
    passwordHash: string
  ): Promise<void> {
    await prisma.passwordHistory.create({
      data: {
        userId,
        hash: passwordHash,
      },
    });

    // Keep only the last N passwords
    const history = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (history.length > 5) {
      await prisma.passwordHistory.deleteMany({
        where: {
          userId,
          id: {
            in: history.slice(5).map((p: { id: string }) => p.id),
          },
        },
      });
    }
  }
} 