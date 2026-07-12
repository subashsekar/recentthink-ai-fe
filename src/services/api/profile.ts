import axios from 'axios';
import type {
  AvatarUploadResponse,
  ProfileResponse,
  ProfileUpdateRequest,
  PublicProfileResponse,
  StatisticsResponse,
} from '@/types/profile';
import { API_ENDPOINTS } from '@/constants';
import { apiClient } from './client';

const EMPTY_STATISTICS: StatisticsResponse = {
  problems_solved: 0,
  courses_completed: 0,
  patterns_learned: 0,
  current_streak: 0,
  longest_streak: 0,
  learning_hours: 0,
  last_active: null,
};

function asNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Accept flat StatisticsResponse or common wrapper shapes from the gateway. */
export function normalizeStatistics(payload: unknown): StatisticsResponse {
  if (!payload || typeof payload !== 'object') {
    return { ...EMPTY_STATISTICS };
  }

  const root = payload as Record<string, unknown>;
  const raw =
    root.statistics && typeof root.statistics === 'object'
      ? (root.statistics as Record<string, unknown>)
      : root.data && typeof root.data === 'object' && !('problems_solved' in root)
        ? (root.data as Record<string, unknown>)
        : root;

  return {
    problems_solved: asNumber(raw.problems_solved),
    courses_completed: asNumber(raw.courses_completed),
    patterns_learned: asNumber(raw.patterns_learned),
    current_streak: asNumber(raw.current_streak),
    longest_streak: asNumber(raw.longest_streak),
    learning_hours: asNumber(raw.learning_hours),
    last_active: typeof raw.last_active === 'string' ? raw.last_active : null,
  };
}

export const profileApi = {
  getMe: async (): Promise<ProfileResponse | null> => {
    try {
      const res = await apiClient.get<ProfileResponse>(API_ENDPOINTS.PROFILE.ME);
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  update: async (data: ProfileUpdateRequest): Promise<ProfileResponse> => {
    const res = await apiClient.patch<ProfileResponse>(API_ENDPOINTS.PROFILE.ME, data);
    return res.data;
  },

  getStatistics: async (): Promise<StatisticsResponse> => {
    const res = await apiClient.get<unknown>(API_ENDPOINTS.PROFILE.STATISTICS);
    return normalizeStatistics(res.data);
  },

  uploadAvatar: async (file: File): Promise<AvatarUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<AvatarUploadResponse>(API_ENDPOINTS.PROFILE.AVATAR, formData, {
      // Let the browser set multipart boundary; override instance JSON default.
      headers: { 'Content-Type': undefined },
    });
    return res.data;
  },

  deleteAvatar: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PROFILE.AVATAR);
  },

  getPublic: async (username: string): Promise<PublicProfileResponse> => {
    const res = await apiClient.get<PublicProfileResponse>(API_ENDPOINTS.PROFILE.PUBLIC(username));
    const data = res.data;
    return {
      ...data,
      statistics: normalizeStatistics(data?.statistics ?? data),
    };
  },
};
