import Link from 'next/link';
import { Github, Globe, Linkedin } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { PublicStatistics } from '@/components/profile/ProfileStatistics';
import type { PublicProfileResponse } from '@/types/profile';
import { displayName } from '@/utils/profile';

interface PublicProfileViewProps {
  profile: PublicProfileResponse;
}

export function PublicProfileView({ profile }: PublicProfileViewProps) {
  const name = displayName(profile.first_name, profile.last_name, profile.username);

  const links = [
    profile.github_username
      ? {
          key: 'github',
          href: `https://github.com/${profile.github_username}`,
          label: 'GitHub',
          icon: Github,
        }
      : null,
    profile.linkedin_url
      ? { key: 'linkedin', href: profile.linkedin_url, label: 'LinkedIn', icon: Linkedin }
      : null,
    profile.portfolio_url
      ? { key: 'portfolio', href: profile.portfolio_url, label: 'Portfolio', icon: Globe }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    href: string;
    label: string;
    icon: typeof Github;
  }>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="glass-card overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar name={name} src={profile.profile_picture_url ?? undefined} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
            <p className="mt-1 text-sm text-muted">@{profile.username}</p>
            {profile.primary_skill && (
              <div className="mt-3">
                <Badge>{profile.primary_skill}</Badge>
              </div>
            )}
            {profile.bio && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-secondary-text">
                {profile.bio}
              </p>
            )}
            {links.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {links.map(({ key, href, label, icon: Icon }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Learning Statistics</h2>
        <PublicStatistics statistics={profile.statistics} />
      </div>

      <p className="text-center text-sm text-muted">
        <Link href="/" className="text-primary hover:underline">
          RecentThink
        </Link>
      </p>
    </div>
  );
}
