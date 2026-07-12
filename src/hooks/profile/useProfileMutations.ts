'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/services/api/profile';
import type { ProfileUpdateRequest } from '@/types/profile';
import { profileKeys } from './queryKeys';

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) => profileApi.update(data),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.me(), profile);
      queryClient.invalidateQueries({ queryKey: profileKeys.stats() });
      if (profile.username) {
        queryClient.invalidateQueries({ queryKey: profileKeys.public(profile.username) });
      }
    },
  });
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.me(), (prev: unknown) => {
        if (!prev || typeof prev !== 'object') return prev;
        return { ...prev, profile_picture_url: data.profile_picture_url };
      });
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useDeleteAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileApi.deleteAvatar(),
    onSuccess: () => {
      queryClient.setQueryData(profileKeys.me(), (prev: unknown) => {
        if (!prev || typeof prev !== 'object') return prev;
        return { ...prev, profile_picture_url: null };
      });
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
