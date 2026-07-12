'use client';

import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/services/api/courses';
import { courseKeys } from './queryKeys';

export function useCourseHistory(params?: { limit?: number; offset?: number; q?: string }) {
  return useQuery({
    queryKey: courseKeys.history(params),
    queryFn: () => coursesApi.listChatHistory(params),
  });
}

export function useCourseDetail(courseId: string | null) {
  return useQuery({
    queryKey: courseKeys.detail(courseId ?? ''),
    queryFn: () => coursesApi.getChatHistory(courseId!),
    enabled: Boolean(courseId),
  });
}

export function useCourseChatBySession(sessionId: string | null) {
  return useQuery({
    queryKey: courseKeys.sessionChat(sessionId ?? ''),
    queryFn: () => coursesApi.getChatHistoryBySession(sessionId!),
    enabled: Boolean(sessionId),
  });
}

export function useCourseProgress() {
  return useQuery({
    queryKey: courseKeys.progress(),
    queryFn: () => coursesApi.getProgress(),
  });
}

export function useCourseDashboard() {
  return useQuery({
    queryKey: courseKeys.dashboard(),
    queryFn: () => coursesApi.getDashboard(),
  });
}

export function useCourseExamples() {
  return useQuery({
    queryKey: courseKeys.examples(),
    queryFn: () => coursesApi.getExamples(),
  });
}
