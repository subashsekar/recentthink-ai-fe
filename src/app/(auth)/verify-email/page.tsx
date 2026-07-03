'use client';

import { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { VerifyEmailCard } from '@/components/auth/VerifyEmailCard';

function Content() {
  return (
    <AuthLayout>
      <AuthCard>
        <VerifyEmailCard />
      </AuthCard>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}
