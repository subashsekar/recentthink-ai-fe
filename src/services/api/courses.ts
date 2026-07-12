import type { ApiPaginatedResponse } from '@/types/api';
import type {
  CourseAdaptiveRequest,
  CourseAdaptiveResponse,
  CourseBookmarkRequest,
  CourseDashboard,
  CourseExample,
  CourseExportFormat,
  CourseExportRequest,
  CourseFollowUpRequest,
  CourseFollowUpResponse,
  CourseGenerateRequest,
  CourseGenerateResponse,
  CourseHistoryDetail,
  CourseHistoryItem,
  CourseHistoryListResponse,
  CourseProgress,
  CourseProgressUpdateRequest,
} from '@/types/course';
import { exportMarkdown, exportPdf } from '@/utils/courseExport';
import { normalizeCourseResponse } from '@/utils/normalizeCourse';
import { gatewayClient } from './client';

const GENERATE_TIMEOUT_MS = 120_000;

function normalizeHistoryList(data: unknown): CourseHistoryListResponse {
  if (Array.isArray(data)) {
    return {
      items: data as CourseHistoryItem[],
      page: 1,
      page_size: data.length,
      total: data.length,
    };
  }
  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const items = Array.isArray(record.items) ? (record.items as CourseHistoryItem[]) : [];
  return {
    items,
    page: typeof record.page === 'number' ? record.page : 1,
    page_size: typeof record.page_size === 'number' ? record.page_size : items.length,
    total: typeof record.total === 'number' ? record.total : items.length,
  };
}

export const coursesApi = {
  generate: async (data: CourseGenerateRequest) => {
    const res = await gatewayClient.post<CourseGenerateResponse>('/courses/generate', data, {
      timeout: GENERATE_TIMEOUT_MS,
    });
    return normalizeCourseResponse(res.data);
  },

  followUp: async (data: CourseFollowUpRequest) => {
    const res = await gatewayClient.post<CourseFollowUpResponse>('/courses/follow-up', data, {
      timeout: GENERATE_TIMEOUT_MS,
    });
    return res.data;
  },

  /** Prefer chat-history for the mentor-style sidebar. */
  listChatHistory: async (params?: { limit?: number; offset?: number; q?: string }) => {
    const res = await gatewayClient.get<
      ApiPaginatedResponse<CourseHistoryItem> | CourseHistoryItem[] | CourseHistoryListResponse
    >('/courses/chat-history', { params });
    return normalizeHistoryList(res.data);
  },

  getChatHistory: async (courseId: string) => {
    const res = await gatewayClient.get<CourseHistoryDetail>(`/courses/chat-history/${courseId}`);
    return normalizeCourseResponse(res.data);
  },

  deleteChatHistory: async (courseId: string) => {
    const res = await gatewayClient.delete<{ message?: string; ok?: boolean }>(
      `/courses/chat-history/${courseId}`,
    );
    return res.data;
  },

  /** Open chat history by session_id (e.g. right after generate). */
  getChatHistoryBySession: async (sessionId: string) => {
    const res = await gatewayClient.get<CourseHistoryDetail>(
      `/courses/sessions/${sessionId}/chat-history`,
    );
    return normalizeCourseResponse(res.data);
  },

  /** @deprecated Prefer listChatHistory — kept as alias */
  getHistory: async (params?: { limit?: number; offset?: number; q?: string }) => {
    return coursesApi.listChatHistory(params);
  },

  /** @deprecated Prefer getChatHistory — kept as alias */
  getHistoryDetail: async (courseId: string) => {
    return coursesApi.getChatHistory(courseId);
  },

  /** @deprecated Prefer deleteChatHistory — kept as alias */
  deleteHistory: async (courseId: string) => {
    return coursesApi.deleteChatHistory(courseId);
  },

  getProgress: async () => {
    const res = await gatewayClient.get<CourseProgress | CourseProgress[]>('/courses/progress');
    return res.data;
  },

  updateProgress: async (data: CourseProgressUpdateRequest) => {
    const res = await gatewayClient.post<CourseProgress>('/courses/progress', data);
    return res.data;
  },

  getDashboard: async () => {
    const res = await gatewayClient.get<CourseDashboard>('/courses/dashboard');
    return res.data;
  },

  getExamples: async () => {
    const res = await gatewayClient.get<CourseExample[]>('/courses/examples');
    return Array.isArray(res.data) ? res.data : [];
  },

  adaptive: async (data: CourseAdaptiveRequest) => {
    const res = await gatewayClient.post<CourseAdaptiveResponse>('/courses/adaptive', data);
    return res.data;
  },

  bookmark: async (data: CourseBookmarkRequest) => {
    const res = await gatewayClient.post<{ ok?: boolean }>('/courses/bookmarks', data);
    return res.data;
  },

  exportMarkdown: async (data: CourseExportRequest) => exportMarkdown(data.course_id),

  exportPdf: async (data: CourseExportRequest) => exportPdf(data.course_id),

  export: async (format: CourseExportFormat, courseId: string) => {
    if (format === 'pdf') return exportPdf(courseId);
    return exportMarkdown(courseId);
  },
};
