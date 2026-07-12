import type { ApiPaginatedResponse } from '@/types/api';
import type {
  PatternDashboard,
  PatternExample,
  PatternExportFormat,
  PatternExportRequest,
  PatternFollowUpRequest,
  PatternFollowUpResponse,
  PatternGenerateRequest,
  PatternGenerateResponse,
  PatternHistoryDetail,
  PatternHistoryItem,
  PatternHistoryListResponse,
  PatternProgress,
  PatternProgressUpdateRequest,
} from '@/types/dsaPattern';
import { exportJson, exportMarkdown, exportPdf } from '@/utils/dsaPatternExport';
import { normalizePatternResponse } from '@/utils/normalizeDsaPattern';
import { gatewayClient } from './client';

const GENERATE_TIMEOUT_MS = 120_000;

function normalizeHistoryList(data: unknown): PatternHistoryListResponse {
  if (Array.isArray(data)) {
    return {
      items: data as PatternHistoryItem[],
      page: 1,
      page_size: data.length,
      total: data.length,
    };
  }
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const items = Array.isArray(record.items) ? (record.items as PatternHistoryItem[]) : [];
  return {
    items,
    page: typeof record.page === 'number' ? record.page : 1,
    page_size: typeof record.page_size === 'number' ? record.page_size : items.length,
    total: typeof record.total === 'number' ? record.total : items.length,
  };
}

export const dsaPatternApi = {
  generate: async (data: PatternGenerateRequest) => {
    const res = await gatewayClient.post<PatternGenerateResponse>('/dsa-pattern/generate', data, {
      timeout: GENERATE_TIMEOUT_MS,
    });
    return normalizePatternResponse(res.data);
  },

  followUp: async (data: PatternFollowUpRequest) => {
    const res = await gatewayClient.post<PatternFollowUpResponse>('/dsa-pattern/follow-up', data, {
      timeout: GENERATE_TIMEOUT_MS,
    });
    return res.data;
  },

  listHistory: async (params?: { limit?: number; offset?: number; q?: string }) => {
    const res = await gatewayClient.get<
      ApiPaginatedResponse<PatternHistoryItem> | PatternHistoryItem[] | PatternHistoryListResponse
    >('/dsa-pattern/history', { params });
    return normalizeHistoryList(res.data);
  },

  getHistoryDetail: async (sessionId: string) => {
    const res = await gatewayClient.get<PatternHistoryDetail>(`/dsa-pattern/history/${sessionId}`);
    return normalizePatternResponse(res.data);
  },

  deleteHistory: async (sessionId: string) => {
    const res = await gatewayClient.delete<{ message?: string; ok?: boolean }>(
      `/dsa-pattern/history/${sessionId}`,
    );
    return res.data;
  },

  getProgress: async () => {
    const res = await gatewayClient.get<PatternProgress | PatternProgress[]>(
      '/dsa-pattern/progress',
    );
    return res.data;
  },

  updateProgress: async (data: PatternProgressUpdateRequest) => {
    const res = await gatewayClient.post<PatternProgress>('/dsa-pattern/progress', data);
    return res.data;
  },

  getDashboard: async () => {
    const res = await gatewayClient.get<PatternDashboard>('/dsa-pattern/dashboard');
    return res.data;
  },

  getExamples: async () => {
    const res = await gatewayClient.get<PatternExample[]>('/dsa-pattern/examples');
    return Array.isArray(res.data) ? res.data : [];
  },

  exportMarkdown: async (data: PatternExportRequest) => exportMarkdown(data.pattern_session_id),

  exportJson: async (data: PatternExportRequest) => exportJson(data.pattern_session_id),

  exportPdf: async (data: PatternExportRequest) => exportPdf(data.pattern_session_id),

  export: async (format: PatternExportFormat, patternSessionId: string) => {
    if (format === 'pdf') return exportPdf(patternSessionId);
    if (format === 'json') return exportJson(patternSessionId);
    return exportMarkdown(patternSessionId);
  },
};
