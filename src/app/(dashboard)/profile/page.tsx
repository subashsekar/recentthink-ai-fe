'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { ProfileEmptyState } from '@/components/profile/ProfileEmptyState';
import { ProfileStatistics } from '@/components/profile/ProfileStatistics';
import { useMyProfile } from '@/hooks/profile/useProfileQueries';
import { handleProfileApiError } from '@/utils/profileError';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: profile, isLoading, isError, error, refetch, isFetching } = useMyProfile();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isCreating = profile === null;
  const showOnboarding = isCreating && !showCreateForm;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8 px-1 sm:px-2">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Account</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Profile settings
        </h1>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          Craft a recruiter-ready presence — identity, platforms, skills, and privacy in one place.
        </p>
      </div>

      {isLoading ? (
        <div className="profile-panel rounded-2xl p-10">
          <Loading message="Loading profile…" />
        </div>
      ) : isError ? (
        <div className="profile-panel space-y-3 rounded-2xl p-6">
          <p className="text-sm text-muted">
            {handleProfileApiError(error, 'Could not load profile')}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} isLoading={isFetching}>
            Retry
          </Button>
        </div>
      ) : showOnboarding ? (
        <ProfileEmptyState onStart={() => setShowCreateForm(true)} />
      ) : (
        <ProfileEditForm profile={profile ?? null} authUser={user} isCreating={isCreating} />
      )}

      {!isLoading && !isError && !showOnboarding && <ProfileStatistics />}
    </div>
  );
}
