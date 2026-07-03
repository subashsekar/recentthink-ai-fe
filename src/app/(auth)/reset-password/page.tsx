'use client';

import { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

function Content() {
  return (
    <AuthLayout>
      <AuthCard>
        <ResetPasswordForm />
      </AuthCard>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}
