'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dsaPatternApi } from '@/services/api/dsaPattern';
import type {
  PatternExportFormat,
  PatternFollowUpRequest,
  PatternGenerateRequest,
  PatternProgressUpdateRequest,
} from '@/types/dsaPattern';
import { dsaPatternKeys } from './queryKeys';

export function useGeneratePatternMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatternGenerateRequest) => dsaPatternApi.generate(data),
    onSuccess: (lesson) => {
      if (lesson.session_id) {
        queryClient.setQueryData(dsaPatternKeys.detail(lesson.session_id), lesson);
      }
      queryClient.invalidateQueries({ queryKey: dsaPatternKeys.all });
    },
  });
}

export function usePatternFollowUpMutation() {
  return useMutation({
    mutationFn: (data: PatternFollowUpRequest) => dsaPatternApi.followUp(data),
  });
}

export function useUpdatePatternProgressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatternProgressUpdateRequest) => dsaPatternApi.updateProgress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dsaPatternKeys.progress() });
      queryClient.invalidateQueries({ queryKey: dsaPatternKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: dsaPatternKeys.all });
    },
  });
}

export function useDeletePatternMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => dsaPatternApi.deleteHistory(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dsaPatternKeys.all });
    },
  });
}

export function useExportPatternMutation() {
  return useMutation({
    mutationFn: ({
      format,
      patternSessionId,
    }: {
      format: PatternExportFormat;
      patternSessionId: string;
    }) => dsaPatternApi.export(format, patternSessionId),
  });
}
