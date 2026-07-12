'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, Code2, ExternalLink, Github, Linkedin, Trophy } from 'lucide-react';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUpdateProfileMutation } from '@/hooks/profile/useProfileMutations';
import { CURRENT_STATUSES, PRIMARY_SKILLS, type ProfileResponse } from '@/types/profile';
import type { User } from '@/types/auth';
import { toChangedProfilePayload, profileToUpdateSnapshot } from '@/utils/profile';
import { getAxiosStatus, getProfileFieldErrors, handleProfileApiError } from '@/utils/profileError';
import { profileSchema, type ProfileFormData } from '@/utils/validation';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';

interface ProfileEditFormProps {
  profile: ProfileResponse | null;
  authUser: User | null;
  isCreating: boolean;
}

function toFormDefaults(profile: ProfileResponse | null, authUser: User | null): ProfileFormData {
  return {
    username: profile?.username ?? '',
    first_name: profile?.first_name ?? authUser?.first_name ?? '',
    last_name: profile?.last_name ?? authUser?.last_name ?? '',
    bio: profile?.bio ?? '',
    mobile_number: profile?.mobile_number ?? '',
    current_status: profile?.current_status ?? '',
    college: profile?.college ?? '',
    company: profile?.company ?? '',
    current_role: profile?.current_role ?? '',
    experience_years: profile?.experience_years != null ? String(profile.experience_years) : '',
    primary_skill: profile?.primary_skill ?? '',
    leetcode_username: profile?.leetcode_username ?? '',
    hackerrank_username: profile?.hackerrank_username ?? '',
    github_username: profile?.github_username ?? '',
    linkedin_url: profile?.linkedin_url ?? '',
    portfolio_url: profile?.portfolio_url ?? '',
  };
}

const fieldClass =
  'profile-field flex h-12 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary/50 disabled:opacity-50';

const sectionMotion = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
};

function ProfileSection({
  title,
  description,
  children,
  delay = 0,
}: {
  title: string;
  description: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={sectionMotion.initial}
      whileInView={sectionMotion.whileInView}
      viewport={sectionMotion.viewport}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as const }}
      className="profile-panel rounded-2xl border border-border p-6 sm:p-8"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {children}
    </motion.section>
  );
}

function ChoiceCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex min-h-[52px] items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200',
        selected
          ? 'border-primary/50 bg-primary/15 text-foreground shadow-[0_0_0_1px_rgba(79,157,255,0.25)]'
          : 'border-border bg-surface/50 text-secondary-text hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground',
      )}
    >
      <span>{label}</span>
      {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </button>
  );
}

function PlatformField({
  icon: Icon,
  label,
  accent,
  verifyHref,
  children,
}: {
  icon: typeof Code2;
  label: string;
  accent: string;
  verifyHref?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-4 transition hover:border-primary/25">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border border-border',
              accent,
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold text-foreground">{label}</p>
        </div>
        {verifyHref ? (
          <a
            href={verifyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-secondary-text transition hover:border-primary/40 hover:text-primary"
          >
            Verify
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="inline-flex h-9 items-center rounded-lg border border-dashed border-border px-3 text-xs text-muted">
            Verify
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function ProfileEditForm({ profile, authUser, isCreating }: ProfileEditFormProps) {
  const updateMutation = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormDefaults(profile, authUser),
  });

  useEffect(() => {
    reset(toFormDefaults(profile, authUser));
  }, [profile, authUser, reset]);

  const username = watch('username');
  const bio = watch('bio') ?? '';
  const firstName = watch('first_name');
  const lastName = watch('last_name');
  const primarySkill = watch('primary_skill');
  const leetcode = watch('leetcode_username');
  const hackerrank = watch('hackerrank_username');
  const github = watch('github_username');
  const linkedin = watch('linkedin_url');

  const onSubmit = async (data: ProfileFormData) => {
    const payload = toChangedProfilePayload(data, profileToUpdateSnapshot(profile), {
      sendAllFilled: isCreating,
    });

    if (Object.keys(payload).length === 0) {
      toast.success('No changes to save');
      return;
    }

    try {
      await updateMutation.mutateAsync(payload);
      toast.success(isCreating ? 'Profile created' : 'Profile saved');
    } catch (err) {
      const status = getAxiosStatus(err);
      const fieldErrors = getProfileFieldErrors(err);

      if (status === 409) {
        setError('username', {
          message: handleProfileApiError(err, 'Username is already taken'),
        });
        toast.error('Username is already taken');
        return;
      }

      if (status === 400 || status === 422 || Object.keys(fieldErrors).length > 0) {
        for (const [field, message] of Object.entries(fieldErrors)) {
          setError(field as keyof ProfileFormData, { message });
        }
        toast.error(handleProfileApiError(err, 'Please fix the highlighted fields'));
        return;
      }

      toast.error(handleProfileApiError(err, 'Failed to save profile'));
    }
  };

  const showSticky = isDirty || isCreating;

  return (
    <div className="relative space-y-8 pb-28">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <ProfileHero
          profile={profile}
          authUser={authUser}
          watchedFirstName={firstName}
          watchedLastName={lastName}
          watchedUsername={username}
          avatarDisabled={updateMutation.isPending || isCreating}
        />

        <ProfileSection
          title="Basic information"
          description="Your public identity and short bio"
          delay={0.05}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id="first_name"
              label="First name"
              className="h-12 rounded-xl"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <Input
              id="last_name"
              label="Last name"
              className="h-12 rounded-xl"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
            <Input
              id="username"
              label="Username"
              className="h-12 rounded-xl"
              helperText={`Public URL: /u/${(username || 'username').toLowerCase()}`}
              error={errors.username?.message}
              autoComplete="username"
              {...register('username')}
            />
            <Input
              id="current_role"
              label="Current role"
              className="h-12 rounded-xl"
              placeholder="Software Engineer"
              error={errors.current_role?.message}
              {...register('current_role')}
            />
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="bio" className="text-sm font-semibold text-foreground">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                maxLength={500}
                className={cn(
                  fieldClass,
                  'h-auto min-h-[120px] py-3',
                  errors.bio && 'border-error',
                )}
                placeholder="Tell recruiters what you’re building"
                {...register('bio')}
              />
              <div className="flex justify-between">
                {errors.bio ? <p className="text-xs text-error">{errors.bio.message}</p> : <span />}
                <p className="text-xs text-muted">{bio.length}/500</p>
              </div>
            </div>
            <Input
              id="college"
              label="College"
              className="h-12 rounded-xl"
              error={errors.college?.message}
              {...register('college')}
            />
            <Input
              id="company"
              label="Company"
              className="h-12 rounded-xl"
              error={errors.company?.message}
              {...register('company')}
            />
            <Input
              id="experience_years"
              label="Years of experience"
              type="number"
              min={0}
              max={60}
              className="h-12 rounded-xl"
              error={errors.experience_years?.message}
              {...register('experience_years')}
            />
            <Input
              id="portfolio_url"
              label="Website / portfolio"
              placeholder="https://…"
              className="h-12 rounded-xl"
              error={errors.portfolio_url?.message}
              {...register('portfolio_url')}
            />
          </div>
        </ProfileSection>

        <ProfileSection
          title="Programming profiles"
          description="Link platforms recruiters check first"
          delay={0.08}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <PlatformField
              icon={Code2}
              label="LeetCode"
              accent="text-amber-300"
              verifyHref={leetcode ? `https://leetcode.com/u/${leetcode.replace(/^@/, '')}/` : null}
            >
              <input
                className={fieldClass}
                placeholder="username"
                {...register('leetcode_username')}
              />
              {errors.leetcode_username && (
                <p className="mt-1.5 text-xs text-error">{errors.leetcode_username.message}</p>
              )}
            </PlatformField>

            <PlatformField
              icon={Trophy}
              label="HackerRank"
              accent="text-emerald-300"
              verifyHref={
                hackerrank ? `https://www.hackerrank.com/${hackerrank.replace(/^@/, '')}` : null
              }
            >
              <input
                className={fieldClass}
                placeholder="username"
                {...register('hackerrank_username')}
              />
              {errors.hackerrank_username && (
                <p className="mt-1.5 text-xs text-error">{errors.hackerrank_username.message}</p>
              )}
            </PlatformField>

            <PlatformField
              icon={Github}
              label="GitHub"
              accent="text-foreground"
              verifyHref={github ? `https://github.com/${github.replace(/^@/, '')}` : null}
            >
              <input
                className={fieldClass}
                placeholder="username"
                {...register('github_username')}
              />
              {errors.github_username && (
                <p className="mt-1.5 text-xs text-error">{errors.github_username.message}</p>
              )}
            </PlatformField>

            <PlatformField
              icon={Linkedin}
              label="LinkedIn"
              accent="text-sky-300"
              verifyHref={linkedin || null}
            >
              <input
                className={fieldClass}
                placeholder="https://www.linkedin.com/in/…"
                {...register('linkedin_url')}
              />
              {errors.linkedin_url && (
                <p className="mt-1.5 text-xs text-error">{errors.linkedin_url.message}</p>
              )}
            </PlatformField>
          </div>
        </ProfileSection>

        <ProfileSection
          title="Primary skill"
          description="Pick the skill that best represents you"
          delay={0.1}
        >
          <Controller
            name="primary_skill"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2.5">
                {PRIMARY_SKILLS.map((skill) => {
                  const selected = field.value === skill;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => field.onChange(selected ? '' : skill)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                        selected
                          ? 'border-primary/50 bg-primary/20 text-foreground shadow-[0_0_20px_rgba(79,157,255,0.15)]'
                          : 'border-border bg-surface/40 text-muted hover:border-primary/30 hover:text-foreground',
                      )}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.primary_skill && (
            <p className="mt-3 text-xs text-error">{errors.primary_skill.message}</p>
          )}
          {primarySkill && (
            <p className="mt-4 text-sm text-muted">
              Selected: <span className="font-medium text-foreground">{primarySkill}</span>
            </p>
          )}
        </ProfileSection>

        <ProfileSection
          title="Career focus"
          description="How you want to show up to recruiters"
          delay={0.12}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Current status
          </p>
          <Controller
            name="current_status"
            control={control}
            render={({ field }) => (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CURRENT_STATUSES.map((status) => (
                  <ChoiceCard
                    key={status}
                    label={status}
                    selected={field.value === status}
                    onClick={() => field.onChange(field.value === status ? '' : status)}
                  />
                ))}
              </div>
            )}
          />
        </ProfileSection>

        <ProfileSection
          title="Privacy"
          description="Private contact details — never shown on your public page"
          delay={0.14}
        >
          <div className="max-w-md">
            <Input
              id="mobile_number"
              label="Mobile number"
              placeholder="+919876543210"
              className="h-12 rounded-xl"
              helperText="Optional. E.164-style: optional +, 8–15 digits"
              error={errors.mobile_number?.message}
              {...register('mobile_number')}
            />
          </div>
        </ProfileSection>

        {showSticky && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[rgba(8,16,30,0.82)] px-4 py-3 backdrop-blur-xl sm:px-6"
          >
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                <p className="text-sm font-medium text-foreground">
                  {isCreating ? 'Create your profile to publish' : 'Unsaved changes'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isCreating && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => reset(toFormDefaults(profile, authUser))}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className="rounded-xl px-6"
                  isLoading={updateMutation.isPending}
                >
                  {isCreating ? 'Create profile' : 'Save changes'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </form>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="profile-panel rounded-2xl border border-border p-6 sm:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Account Security
        </p>
        <h2 className="mt-2 text-lg font-semibold text-foreground">Password &amp; danger zone</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Change your password, review sessions, and manage destructive actions from Account
          Security — kept separate from your public profile.
        </p>
        <Link href={ROUTES.ACCOUNT_SECURITY} className="mt-4 inline-flex">
          <Button type="button" variant="outline" className="rounded-xl">
            Open Account Security
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
