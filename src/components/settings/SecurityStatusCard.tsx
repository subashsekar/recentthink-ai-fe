'use client';

import { motion } from 'framer-motion';
import {
  BadgeCheck,
  History,
  Laptop,
  MonitorSmartphone,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

interface SecurityItem {
  icon: LucideIcon;
  title: string;
  description: string;
  status: string;
  statusVariant?: 'default' | 'success' | 'warning';
}

export function SecurityStatusCard() {
  const user = useAuthStore((s) => s.user);

  const items: SecurityItem[] = [
    {
      icon: ShieldCheck,
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account.',
      status: 'Coming Soon',
      statusVariant: 'warning',
    },
    {
      icon: MonitorSmartphone,
      title: 'Active Sessions',
      description: 'Devices currently signed in to RecentThink.',
      status: 'Coming Soon',
    },
    {
      icon: History,
      title: 'Login History',
      description: 'Recent sign-in activity and locations.',
      status: 'Coming Soon',
    },
    {
      icon: Laptop,
      title: 'Connected Devices',
      description: 'Manage trusted browsers and devices.',
      status: 'Coming Soon',
    },
    {
      icon: BadgeCheck,
      title: 'Email Verification Status',
      description: user?.email
        ? `Signed in as ${user.email}`
        : 'Verify your email to secure account recovery.',
      status: user?.is_verified ? 'Verified' : 'Unverified',
      statusVariant: user?.is_verified ? 'success' : 'warning',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="profile-panel rounded-2xl border border-border p-6 sm:p-8"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Security overview
        </h2>
        <p className="mt-1 text-sm text-muted">
          Account protections and activity. Some features are rolling out soon.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className={cn(
              'rounded-2xl border border-border bg-surface/40 p-4 transition hover:border-primary/25',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-primary">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
                </div>
              </div>
              <Badge variant={item.statusVariant ?? 'default'} className="shrink-0">
                {item.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
