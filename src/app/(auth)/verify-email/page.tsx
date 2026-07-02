'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants';

function VerifyEmailHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const mutation = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: () => {
      toast.success('Email verified successfully!');
      router.push(ROUTES.DASHBOARD);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Verification failed';
      toast.error(message);
    },
  });

  if (token && !mutation.isPending && !mutation.isSuccess && !mutation.isError) {
    mutation.mutate({ token });
  }

  if (mutation.isPending) {
    return (
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Verifying your email...</p>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="text-center">
        <p className="text-sm text-green-600 dark:text-green-400">Email verified successfully!</p>
        <p className="mt-2 text-sm text-zinc-500">Redirecting to dashboard...</p>
      </div>
    );
  }

  if (mutation.isError) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-500">Invalid or expired verification link.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(ROUTES.RESEND_VERIFICATION)}
        >
          Resend verification email
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-zinc-500">No verification token provided.</p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => router.push(ROUTES.RESEND_VERIFICATION)}
      >
        Resend verification email
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Email Verification
          </h1>
        </div>
        <Suspense fallback={<div className="text-center text-sm text-zinc-500">Loading...</div>}>
          <VerifyEmailHandler />
        </Suspense>
      </div>
    </div>
  );
}
