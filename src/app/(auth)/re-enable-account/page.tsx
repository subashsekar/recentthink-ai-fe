'use client';

import { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { ReEnableAccountForm } from '@/components/auth/ReEnableAccountForm';
import { Spinner } from '@/components/ui/Spinner';

export default function ReEnableAccountPage() {
  return (
    <AuthLayout>
      <AuthCard>
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          }
        >
          <ReEnableAccountForm />
        </Suspense>
      </AuthCard>
    </AuthLayout>
  );
}
