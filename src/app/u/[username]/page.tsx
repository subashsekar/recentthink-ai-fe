'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { PublicProfileView } from '@/components/profile/PublicProfileView';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { usePublicProfile } from '@/hooks/profile/useProfileQueries';
import { getAxiosStatus, handleProfileApiError } from '@/utils/profileError';
import { ROUTES } from '@/constants';

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = typeof params.username === 'string' ? params.username : '';
  const { data, isLoading, isError, error, refetch, isFetching } = usePublicProfile(
    username || null,
  );

  if (!username) {
    return (
      <AnimatedBackground>
        <NotFoundState username="" />
      </AnimatedBackground>
    );
  }

  if (isLoading) {
    return (
      <AnimatedBackground>
        <Loading message="Loading profile…" />
      </AnimatedBackground>
    );
  }

  if (isError || !data) {
    const status = getAxiosStatus(error);
    if (status === 404 || !data) {
      return (
        <AnimatedBackground>
          <NotFoundState username={username} />
        </AnimatedBackground>
      );
    }
    return (
      <AnimatedBackground>
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
          <p className="text-sm text-muted">
            {handleProfileApiError(error, 'Could not load this profile')}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} isLoading={isFetching}>
            Retry
          </Button>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <PublicProfileView profile={data} />
    </AnimatedBackground>
  );
}

function NotFoundState({ username }: { username: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="glass-card max-w-md space-y-3 p-8">
        <h1 className="text-2xl font-semibold text-foreground">Profile not found</h1>
        <p className="text-sm text-muted">
          {username
            ? `We couldn’t find a public profile for @${username}.`
            : 'This profile URL is invalid.'}
        </p>
        <Link
          href={ROUTES.HOME}
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
