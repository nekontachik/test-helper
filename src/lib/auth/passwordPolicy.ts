import { pwnedPassword } from 'hibp';
import zxcvbn from 'zxcvbn';

export interface PasswordStrengthResult {
  score: number;
  feedback: {
    warning?: string;
    suggestions: string[];
  };
  isStrong: boolean;
  failedPolicies: string[];
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
  };

  static readonly POLICY_MESSAGES = {
    [PasswordPolicyService.POLICIES.LENGTH]: `Password must be between ${PasswordPolicyService.MIN_LENGTH} and ${PasswordPolicyService.MAX_LENGTH} characters`,
    [PasswordPolicyService.POLICIES.UPPERCASE]: 'Password must contain at least one uppercase letter',
    [PasswordPolicyService.POLICIES.LOWERCASE]: 'Password must contain at least one lowercase letter',
    [PasswordPolicyService.POLICIES.NUMBER]: 'Password must contain at least one number',
    [PasswordPolicyService.POLICIES.SPECIAL]: 'Password must contain at least one special character',
    [PasswordPolicyService.POLICIES.COMMON]: 'Password is too common or easily guessable',
    [PasswordPolicyService.POLICIES.BREACHED]: 'Password has been exposed in data breaches',
    [PasswordPolicyService.POLICIES.PERSONAL]: 'Password contains personal information',
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
    ].filter(Boolean);

    const result = zxcvbn(password, userInputs);

    // Check for common passwords and patterns
    if (result.score < this.MIN_SCORE) {
      failedPolicies.push(this.POLICIES.COMMON);
    }

    // Check for personal information
    if (userInputs.some(input => 
      input && password.toLowerCase().includes(input.toLowerCase())
    )) {
      failedPolicies.push(this.POLICIES.PERSONAL);
    }

    return {
      score: result.score,
      feedback: {
        warning: result.feedback.warning,
        suggestions: [
          ...result.feedback.suggestions,
          ...failedPolicies.map(policy => this.POLICY_MESSAGES[policy]),
        ],
      },
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
    });

    if (history.length > 5) {
      await prisma.passwordHistory.deleteMany({
        where: {
          userId,
          id: {
            in: history.slice(5).map(p => p.id),
          },
        },
      });
    }
  }
} 