import axios from 'axios';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store/authStore';
import { createApiRequestError, parseApiErrorMessage } from '@/utils/apiError';

export function getAxiosErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const data = err.response?.data;
    if (typeof data === 'string') {
      return parseApiErrorMessage(status, data);
    }
    if (data && typeof data === 'object') {
      return parseApiErrorMessage(status, JSON.stringify(data));
    }
    if (status === 429) return 'Rate limit reached. Please wait a moment and try again.';
    if (status === 422) return 'Please check your inputs and try again.';
    if (status) return parseApiErrorMessage(status, '');
    return err.message || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function handleCourseApiError(err: unknown, fallback?: string): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.assign(ROUTES.LOGIN);
      }
      return 'Session expired. Please log in again.';
    }
    if (status === 403) return "You don't own this course";
    if (status === 404) return 'Course not found';
    if (status === 429) return 'Too many exports, try again';
  }

  const message = getAxiosErrorMessage(err, fallback);
  return message;
}

export function toApiRequestError(err: unknown) {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const raw =
      typeof err.response?.data === 'string'
        ? err.response.data
        : JSON.stringify(err.response?.data ?? '');
    return createApiRequestError(status, raw);
  }
  return err;
}
