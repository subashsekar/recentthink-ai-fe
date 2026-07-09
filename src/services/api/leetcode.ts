import type { ApiPaginatedResponse } from '@/types/api';
import type {
  LeetCodeAnalyzeRequest,
  LeetCodeExamplesItem,
  LeetCodeFollowUpRequest,
  LeetCodeMode,
  LeetCodeProgress,
  LeetCodeSessionDetail,
  LeetCodeSessionSummary,
  LeetCodeStreamEvent,
} from '@/types/leetcode';
import { apiClient, gatewayClient } from './client';
import { streamLeetCode } from './streaming';

export const leetcodeApi = {
  analyze: async (data: LeetCodeAnalyzeRequest) => {
    const res = await gatewayClient.post<LeetCodeSessionDetail>('/leetcode/analyze', data);
    return res.data;
  },

  analyzeStream: async (
    data: LeetCodeAnalyzeRequest,
    onEvent: (evt: LeetCodeStreamEvent) => void,
    signal?: AbortSignal,
  ) => {
    await streamLeetCode('/leetcode/analyze', { method: 'POST', body: data, signal }, onEvent);
  },

  followUp: async (data: LeetCodeFollowUpRequest) => {
    const res = await gatewayClient.post<LeetCodeSessionDetail>('/leetcode/follow-up', {
      session_id: data.session_id,
      question: data.question,
      mode_id: data.mode_id,
      model: data.model ?? data.model_id,
    });
    return res.data;
  },

  followUpStream: async (
    data: LeetCodeFollowUpRequest,
    onEvent: (evt: LeetCodeStreamEvent) => void,
    signal?: AbortSignal,
  ) => {
    await streamLeetCode('/leetcode/follow-up', { method: 'POST', body: data, signal }, onEvent);
  },

  getHistory: async (params?: { limit?: number; offset?: number; q?: string }) => {
    // Gateway contract: /leetcode/history?limit=50&offset=0 (+ optional q)
    const res = await gatewayClient.get<ApiPaginatedResponse<LeetCodeSessionSummary>>(
      '/leetcode/history',
      {
        params,
      },
    );
    return res.data;
  },

  getSession: async (sessionId: string) => {
    const res = await gatewayClient.get<LeetCodeSessionDetail>(`/leetcode/history/${sessionId}`);
    return res.data;
  },

  deleteSession: async (sessionId: string) => {
    const res = await gatewayClient.delete<{ ok: true }>(`/leetcode/history/${sessionId}`);
    return res.data;
  },

  patchSession: async (
    sessionId: string,
    patch: Partial<{
      title: string;
      is_pinned: boolean;
      is_archived: boolean;
      restore: boolean;
      model_id: string;
    }>,
  ) => {
    const res = await gatewayClient.patch<LeetCodeSessionSummary>(
      `/leetcode/history/${sessionId}`,
      patch,
    );
    return res.data;
  },

  getModes: async () => {
    const res = await gatewayClient.get<LeetCodeMode[]>('/leetcode/modes');
    return res.data;
  },

  getProgress: async () => {
    const res = await gatewayClient.get<LeetCodeProgress>('/leetcode/progress');
    return res.data;
  },

  getExamples: async () => {
    const res = await gatewayClient.get<LeetCodeExamplesItem[]>('/leetcode/examples');
    return res.data;
  },
};
