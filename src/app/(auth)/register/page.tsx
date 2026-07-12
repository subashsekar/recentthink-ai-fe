'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout useGifBranding>
      <AuthCard>
        <RegisterForm />
      </AuthCard>
    </AuthLayout>
  );
}
