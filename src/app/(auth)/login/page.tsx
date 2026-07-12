'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout useGifBranding>
      <AuthCard>
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  );
}
