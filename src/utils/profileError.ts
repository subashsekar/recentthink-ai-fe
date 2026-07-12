import axios from 'axios';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store/authStore';
import { getAxiosErrorMessage } from '@/utils/courseError';

type FastApiValidationItem = {
  msg?: string;
  loc?: Array<string | number>;
};

export function getProfileFieldErrors(err: unknown): Record<string, string> {
  if (!axios.isAxiosError(err)) return {};
  const detail = err.response?.data?.detail;
  if (!Array.isArray(detail)) return {};

  const fields: Record<string, string> = {};
  for (const item of detail as FastApiValidationItem[]) {
    if (!Array.isArray(item.loc) || !item.msg) continue;
    const field = item.loc.filter((part) => part !== 'body' && typeof part === 'string').at(-1);
    if (typeof field === 'string' && field && !fields[field]) {
      fields[field] = item.msg;
    }
  }
  return fields;
}

export function handleProfileApiError(err: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.assign(ROUTES.LOGIN);
      }
      return 'Session expired. Please log in again.';
    }
    if (status === 403) return "You can't edit this profile";
    if (status === 404) return 'Profile not found';
    if (status === 409) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string' && detail.trim()) return detail;
      return 'Username is already taken';
    }
    if (status === 400 || status === 422) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string' && detail.trim()) return detail;
    }
  }

  return getAxiosErrorMessage(err, fallback);
}

export function getAxiosStatus(err: unknown): number | undefined {
  if (axios.isAxiosError(err)) return err.response?.status;
  return undefined;
}
