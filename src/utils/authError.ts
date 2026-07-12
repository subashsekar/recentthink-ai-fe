import axios from 'axios';
import { getAxiosErrorMessage } from '@/utils/courseError';

export type LoginAccountErrorKind = 'blocked' | 'disabled' | 'other';

export type LoginAccountError = {
  kind: LoginAccountErrorKind;
  message: string;
};

function extractCode(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  if (typeof obj.code === 'string') return obj.code;
  const detail = obj.detail;
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const nested = detail as Record<string, unknown>;
    if (typeof nested.code === 'string') return nested.code;
  }
  return null;
}

function extractMessage(data: unknown): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.detail === 'string') return obj.detail;
    if (obj.detail && typeof obj.detail === 'object' && !Array.isArray(obj.detail)) {
      const nested = obj.detail as Record<string, unknown>;
      if (typeof nested.message === 'string') return nested.message;
    }
  }
  return '';
}

export function getLoginAccountError(err: unknown): LoginAccountError {
  const fallback = getAxiosErrorMessage(err, 'Invalid email or password');

  if (!axios.isAxiosError(err)) {
    return { kind: 'other', message: fallback };
  }

  const status = err.response?.status;
  const data = err.response?.data;
  const code = extractCode(data)?.toUpperCase() ?? '';
  const message = extractMessage(data).toLowerCase();

  if (
    code === 'ACCOUNT_BLOCKED' ||
    message.includes('account blocked') ||
    message.includes('blocked')
  ) {
    return {
      kind: 'blocked',
      message: 'Account blocked. Contact support.',
    };
  }

  if (
    code === 'ACCOUNT_DISABLED' ||
    message.includes('account disabled') ||
    message.includes('disabled') ||
    message.includes('inactive') ||
    message.includes('not active') ||
    (status === 403 && message.includes('active'))
  ) {
    return {
      kind: 'disabled',
      message: 'Account disabled',
    };
  }

  return { kind: 'other', message: fallback };
}
