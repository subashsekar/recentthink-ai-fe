'use client';

import { Check, Circle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getPasswordRequirements, getPasswordStrength } from '@/utils/passwordStrength';

interface PasswordStrengthMeterProps {
  password: string;
}

const LEVEL_COLORS: Record<string, string> = {
  empty: 'bg-white/10',
  weak: 'bg-red-400',
  fair: 'bg-amber-400',
  good: 'bg-sky-400',
  strong: 'bg-emerald-400',
};

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password);
  const requirements = getPasswordRequirements(password);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted">Password strength</span>
          {strength.label && (
            <span
              className={cn(
                'font-semibold',
                strength.level === 'weak' && 'text-red-400',
                strength.level === 'fair' && 'text-amber-400',
                strength.level === 'good' && 'text-sky-400',
                strength.level === 'strong' && 'text-emerald-400',
              )}
            >
              {strength.label}
            </span>
          )}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              LEVEL_COLORS[strength.level],
            )}
            style={{ width: `${strength.percent}%` }}
          />
        </div>
      </div>

      <ul className="grid gap-1.5 sm:grid-cols-2">
        {requirements.map((req) => (
          <li
            key={req.id}
            className={cn(
              'flex items-center gap-2 text-xs',
              req.met ? 'text-emerald-400' : 'text-muted',
            )}
          >
            {req.met ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
