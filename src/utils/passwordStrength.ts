export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'upper', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'lower', label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { id: 'number', label: 'One number', met: /[0-9]/.test(password) },
    { id: 'special', label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function getPasswordStrength(password: string): {
  level: PasswordStrengthLevel;
  score: number;
  label: string;
  percent: number;
} {
  if (!password) {
    return { level: 'empty', score: 0, label: '', percent: 0 };
  }

  const requirements = getPasswordRequirements(password);
  const met = requirements.filter((r) => r.met).length;
  let score = met;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  if (score <= 2) {
    return { level: 'weak', score, label: 'Weak', percent: 25 };
  }
  if (score <= 4) {
    return { level: 'fair', score, label: 'Fair', percent: 50 };
  }
  if (score <= 5) {
    return { level: 'good', score, label: 'Good', percent: 75 };
  }
  return { level: 'strong', score, label: 'Strong', percent: 100 };
}
