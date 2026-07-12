'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { ProfileResponse } from '@/types/profile';
import type { User } from '@/types/auth';
import { ROUTES } from '@/constants';
import { displayName, getProfileCompletion } from '@/utils/profile';

interface ProfileHeroProps {
  profile: ProfileResponse | null;
  authUser: User | null;
  watchedFirstName?: string;
  watchedLastName?: string;
  watchedUsername?: string;
  avatarDisabled?: boolean;
}

export function ProfileHero({
  profile,
  authUser,
  watchedFirstName,
  watchedLastName,
  watchedUsername,
  avatarDisabled,
}: ProfileHeroProps) {
  const name = displayName(
    watchedFirstName || profile?.first_name || authUser?.first_name,
    watchedLastName || profile?.last_name || authUser?.last_name,
  );
  const username = (watchedUsername || profile?.username || '').toLowerCase();
  const completion = getProfileCompletion({
    ...profile,
    first_name: watchedFirstName || profile?.first_name,
    last_name: watchedLastName || profile?.last_name,
    username: username || profile?.username,
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="profile-hero relative overflow-hidden rounded-2xl border border-border p-6 shadow-xl sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,157,255,0.22),transparent_55%)]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <AvatarUploader
            name={name}
            profilePictureUrl={profile?.profile_picture_url}
            disabled={avatarDisabled}
            size="2xl"
          />

          <div className="min-w-0 space-y-3 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {name}
              </h1>
              {authUser?.is_verified && (
                <Badge
                  variant="success"
                  className="inline-flex items-center gap-1 border border-success/20 bg-success/10"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </Badge>
              )}
            </div>

            {authUser?.email && <p className="text-sm text-muted">{authUser.email}</p>}

            {username ? (
              <p className="font-mono text-sm text-secondary-text">@{username}</p>
            ) : (
              <p className="text-sm text-muted">Choose a username to publish your profile</p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {username && (
                <Link
                  href={ROUTES.PUBLIC_PROFILE(username)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button type="button" variant="outline" size="sm" className="rounded-xl">
                    Public profile
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="w-full max-w-md space-y-3 rounded-2xl border border-border bg-surface/40 p-5 backdrop-blur-md lg:min-w-[300px]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Profile completion
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {completion.percent}%
                <span className="ml-1 text-sm font-medium text-muted">Complete</span>
              </p>
            </div>
            <p className="text-xs text-muted">
              {completion.filled}/{completion.total} fields
            </p>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${completion.percent}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="text-sm text-muted">Complete your profile to unlock recruiter features.</p>
        </div>
      </div>
    </motion.section>
  );
}
