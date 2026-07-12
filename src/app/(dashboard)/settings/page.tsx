'use client';

import { ChangePasswordCard } from '@/components/settings/ChangePasswordCard';
import { SecurityStatusCard } from '@/components/settings/SecurityStatusCard';
import { DangerZoneCard } from '@/components/settings/DangerZoneCard';

export default function AccountSecurityPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8 px-1 sm:px-2">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Account</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Account Security
        </h1>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          Manage your password, verification status, and account accessibility.
        </p>
      </div>

      <ChangePasswordCard />
      <SecurityStatusCard />
      <DangerZoneCard />
    </div>
  );
}
