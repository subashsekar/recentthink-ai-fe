'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { ResendVerificationForm } from '@/components/auth/ResendVerificationForm';

export default function ResendVerificationPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <ResendVerificationForm />
      </AuthCard>
    </AuthLayout>
  );
}
