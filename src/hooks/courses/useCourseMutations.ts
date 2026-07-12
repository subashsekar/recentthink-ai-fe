'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/services/api/courses';
import type {
  CourseAdaptiveRequest,
  CourseBookmarkRequest,
  CourseFollowUpRequest,
  CourseGenerateRequest,
  CourseProgressUpdateRequest,
} from '@/types/course';
import { courseKeys } from './queryKeys';

export function useGenerateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CourseGenerateRequest) => coursesApi.generate(data),
    onSuccess: (course) => {
      queryClient.setQueryData(courseKeys.detail(course.course_id), course);
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

export function useCourseFollowUpMutation() {
  return useMutation({
    mutationFn: (data: CourseFollowUpRequest) => coursesApi.followUp(data),
  });
}

export function useUpdateCourseProgressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CourseProgressUpdateRequest) => coursesApi.updateProgress(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.progress() });
      queryClient.invalidateQueries({ queryKey: courseKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.course_id) });
    },
  });
}

export function useCourseAdaptiveMutation() {
  return useMutation({
    mutationFn: (data: CourseAdaptiveRequest) => coursesApi.adaptive(data),
  });
}

export function useCourseBookmarkMutation() {
  return useMutation({
    mutationFn: (data: CourseBookmarkRequest) => coursesApi.bookmark(data),
  });
}

export function useDeleteCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => coursesApi.deleteChatHistory(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

export function useExportCourseMutation() {
  return useMutation({
    mutationFn: ({ format, courseId }: { format: 'markdown' | 'pdf'; courseId: string }) =>
      coursesApi.export(format, courseId),
  });
}

export function useInvalidateCourseQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: courseKeys.all }),
    invalidateDetail: (courseId: string) =>
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) }),
    invalidateDashboard: () => queryClient.invalidateQueries({ queryKey: courseKeys.dashboard() }),
  };
}
