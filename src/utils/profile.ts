import {
  AVATAR_ALLOWED_TYPES,
  AVATAR_MAX_BYTES,
  CURRENT_STATUSES,
  PRIMARY_SKILLS,
  type ProfileUpdateRequest,
} from '@/types/profile';

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    return 'Avatar must be JPEG, PNG, WebP, or GIF';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Avatar must be 2 MB or smaller';
  }
  return null;
}

function emptyToNull(value: string | undefined | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function stripAt(value: string | null): string | null {
  if (!value) return null;
  return value.replace(/^@+/, '');
}

/** Trim whitespace; empty strings become null. Platform handles strip leading @. */
export function toProfileUpdatePayload(data: Record<string, unknown>): ProfileUpdateRequest {
  const usernameRaw = emptyToNull(data.username as string | null | undefined);
  const experienceRaw = data.experience_years;

  let experience_years: number | null = null;
  if (experienceRaw !== '' && experienceRaw != null) {
    const n = typeof experienceRaw === 'number' ? experienceRaw : Number(experienceRaw);
    experience_years = Number.isFinite(n) ? n : null;
  }

  const current_status = emptyToNull(data.current_status as string | null | undefined);
  const primary_skill = emptyToNull(data.primary_skill as string | null | undefined);

  return {
    username: usernameRaw ? usernameRaw.toLowerCase() : null,
    first_name: emptyToNull(data.first_name as string | null | undefined),
    last_name: emptyToNull(data.last_name as string | null | undefined),
    mobile_number: emptyToNull(data.mobile_number as string | null | undefined),
    bio: emptyToNull(data.bio as string | null | undefined),
    current_status:
      current_status && (CURRENT_STATUSES as readonly string[]).includes(current_status)
        ? (current_status as ProfileUpdateRequest['current_status'])
        : null,
    college: emptyToNull(data.college as string | null | undefined),
    company: emptyToNull(data.company as string | null | undefined),
    current_role: emptyToNull(data.current_role as string | null | undefined),
    experience_years,
    primary_skill:
      primary_skill && (PRIMARY_SKILLS as readonly string[]).includes(primary_skill)
        ? (primary_skill as ProfileUpdateRequest['primary_skill'])
        : null,
    leetcode_username: stripAt(emptyToNull(data.leetcode_username as string | null | undefined)),
    hackerrank_username: stripAt(
      emptyToNull(data.hackerrank_username as string | null | undefined),
    ),
    github_username: stripAt(emptyToNull(data.github_username as string | null | undefined)),
    linkedin_url: emptyToNull(data.linkedin_url as string | null | undefined),
    portfolio_url: emptyToNull(data.portfolio_url as string | null | undefined),
  };
}

/** PATCH body with only fields that differ from the last-loaded profile (or all filled on create). */
export function toChangedProfilePayload(
  data: Record<string, unknown>,
  previous: ProfileUpdateRequest | null,
  options?: { sendAllFilled?: boolean },
): ProfileUpdateRequest {
  const next = toProfileUpdatePayload(data);

  if (options?.sendAllFilled || !previous) {
    const partial: ProfileUpdateRequest = {};
    for (const [key, value] of Object.entries(next) as Array<
      [keyof ProfileUpdateRequest, ProfileUpdateRequest[keyof ProfileUpdateRequest]]
    >) {
      if (value !== null && value !== undefined && value !== '') {
        (partial as Record<string, unknown>)[key] = value;
      }
    }
    return partial;
  }

  const partial: ProfileUpdateRequest = {};
  for (const [key, value] of Object.entries(next) as Array<
    [keyof ProfileUpdateRequest, ProfileUpdateRequest[keyof ProfileUpdateRequest]]
  >) {
    const prev = previous[key] ?? null;
    const normalizedPrev = typeof prev === 'string' ? prev : prev;
    if (value !== normalizedPrev) {
      (partial as Record<string, unknown>)[key] = value;
    }
  }
  return partial;
}

export function profileToUpdateSnapshot(
  profile: {
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    mobile_number?: string | null;
    bio?: string | null;
    current_status?: string | null;
    college?: string | null;
    company?: string | null;
    current_role?: string | null;
    experience_years?: number | null;
    primary_skill?: string | null;
    leetcode_username?: string | null;
    hackerrank_username?: string | null;
    github_username?: string | null;
    linkedin_url?: string | null;
    portfolio_url?: string | null;
  } | null,
): ProfileUpdateRequest | null {
  if (!profile) return null;
  return toProfileUpdatePayload({
    ...profile,
    experience_years: profile.experience_years != null ? String(profile.experience_years) : '',
  });
}

export function formatLastActive(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function displayName(
  first: string | null | undefined,
  last: string | null | undefined,
  fallback = 'User',
): string {
  const name = [first, last].filter(Boolean).join(' ').trim();
  return name || fallback;
}

export function getProfileCompletion(
  profile: {
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    bio?: string | null;
    profile_picture_url?: string | null;
    current_status?: string | null;
    primary_skill?: string | null;
    company?: string | null;
    college?: string | null;
    current_role?: string | null;
    leetcode_username?: string | null;
    hackerrank_username?: string | null;
    github_username?: string | null;
    linkedin_url?: string | null;
    portfolio_url?: string | null;
    mobile_number?: string | null;
  } | null,
): { percent: number; filled: number; total: number } {
  const checks = [
    Boolean(profile?.username),
    Boolean(profile?.first_name),
    Boolean(profile?.last_name),
    Boolean(profile?.bio),
    Boolean(profile?.profile_picture_url),
    Boolean(profile?.current_status),
    Boolean(profile?.primary_skill),
    Boolean(profile?.company || profile?.college),
    Boolean(profile?.current_role),
    Boolean(profile?.leetcode_username || profile?.hackerrank_username),
    Boolean(profile?.github_username),
    Boolean(profile?.linkedin_url || profile?.portfolio_url),
    Boolean(profile?.mobile_number),
  ];
  const filled = checks.filter(Boolean).length;
  const total = checks.length;
  const percent = Math.round((filled / total) * 100);
  return { percent, filled, total };
}
