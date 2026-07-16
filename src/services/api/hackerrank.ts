import type { ApiPaginatedResponse } from '@/types/api';
import type {
  HackerRankAnalyzeRequest,
  HackerRankExamplesItem,
  HackerRankFollowUpRequest,
  HackerRankMode,
  HackerRankProgress,
  HackerRankSessionDetail,
  HackerRankSessionSummary,
  HackerRankStreamEvent,
} from '@/types/hackerrank';
import { hackerrankClient } from './client';
import { streamHackerRank } from './streaming-hackerrank';

function analyzeBody(data: HackerRankAnalyzeRequest) {
  return {
    problem_url: data.problem_url ?? null,
    problem_statement: data.problem_statement ?? null,
    title: data.title ?? null,
    model_id: data.model_id ?? null,
    mode_id: data.mode_id ?? null,
  };
}

export const hackerrankApi = {
  analyze: async (data: HackerRankAnalyzeRequest) => {
    const res = await hackerrankClient.post<HackerRankSessionDetail>(
      '/hackerrank/analyze',
      analyzeBody(data),
    );
    return res.data;
  },

  analyzeStream: async (
    data: HackerRankAnalyzeRequest,
    onEvent: (evt: HackerRankStreamEvent) => void,
    signal?: AbortSignal,
  ) => {
    await streamHackerRank(
      '/hackerrank/analyze?stream=true',
      { method: 'POST', body: analyzeBody(data), signal },
      onEvent,
    );
  },

  followUp: async (data: HackerRankFollowUpRequest) => {
    const res = await hackerrankClient.post<HackerRankSessionDetail>('/hackerrank/follow-up', {
      session_id: data.session_id,
      question: data.question,
      mode_id: data.mode_id ?? null,
      model: data.model ?? data.model_id ?? null,
    });
    return res.data;
  },

  followUpStream: async (
    data: HackerRankFollowUpRequest,
    onEvent: (evt: HackerRankStreamEvent) => void,
    signal?: AbortSignal,
  ) => {
    await streamHackerRank(
      '/hackerrank/follow-up',
      {
        method: 'POST',
        body: {
          session_id: data.session_id,
          question: data.question,
          mode_id: data.mode_id ?? null,
          model: data.model ?? data.model_id ?? null,
        },
        signal,
      },
      onEvent,
    );
  },

  getAgents: async () => {
    const res = await hackerrankClient.get<unknown>('/hackerrank/agents');
    return res.data;
  },

  getHistory: async (params?: { limit?: number; offset?: number; q?: string }) => {
    const res = await hackerrankClient.get<ApiPaginatedResponse<HackerRankSessionSummary>>(
      '/hackerrank/history',
      { params },
    );
    return res.data;
  },

  getSession: async (sessionId: string) => {
    const res = await hackerrankClient.get<HackerRankSessionDetail>(
      `/hackerrank/history/${sessionId}`,
    );
    return res.data;
  },

  deleteSession: async (sessionId: string) => {
    const res = await hackerrankClient.delete<{ ok: true }>(`/hackerrank/history/${sessionId}`);
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
      mode_id: string;
    }>,
  ) => {
    const res = await hackerrankClient.patch<HackerRankSessionSummary>(
      `/hackerrank/history/${sessionId}`,
      patch,
    );
    return res.data;
  },

  getModes: async () => {
    const res = await hackerrankClient.get<HackerRankMode[]>('/hackerrank/modes');
    return res.data.map((mode) => ({ ...mode, recommended: Boolean(mode.recommended) }));
  },

  getProgress: async () => {
    const res = await hackerrankClient.get<HackerRankProgress>('/hackerrank/progress');
    return res.data;
  },

  getExamples: async () => {
    const res = await hackerrankClient.get<HackerRankExamplesItem[]>('/hackerrank/examples');
    return res.data;
  },

  getVersions: async (sessionId: string) => {
    const res = await hackerrankClient.get<unknown>(`/hackerrank/sessions/${sessionId}/versions`);
    return res.data;
  },

  exportMarkdown: async (sessionId: string) => {
    const res = await hackerrankClient.post<Blob>(
      '/hackerrank/export/markdown',
      { session_id: sessionId },
      { responseType: 'blob' },
    );
    return res.data;
  },

  exportJson: async (sessionId: string) => {
    const res = await hackerrankClient.post<Blob>(
      '/hackerrank/export/json',
      { session_id: sessionId },
      { responseType: 'blob' },
    );
    return res.data;
  },

  exportPdf: async (sessionId: string) => {
    const res = await hackerrankClient.post<Blob>(
      '/hackerrank/export/pdf',
      { session_id: sessionId },
      { responseType: 'blob' },
    );
    return res.data;
  },
};
