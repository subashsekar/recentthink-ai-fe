'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { authService } from '@/services/authService';
import { ROUTES } from '@/constants';

export function VerifyEmailCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const mutation = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: () => {
      toast.success('Email verified successfully!');
      setTimeout(() => router.push(ROUTES.LOGIN), 1500);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Verification failed');
    },
  });

  if (token && !mutation.isPending && !mutation.isSuccess && !mutation.isError) {
    mutation.mutate({ token });
  }

  return (
    <div className="animate-fade-in">
      {mutation.isPending && (
        <div className="py-16 text-center">
          <Loader2 size={36} className="mx-auto mb-6 animate-spin text-primary" />
          <p className="text-sm text-muted">Verifying your email...</p>
        </div>
      )}

      {mutation.isSuccess && (
        <div className="animate-scale-in py-16 text-center">
          <CheckCircle2 size={48} className="mx-auto mb-6 text-success" />
          <p className="font-medium text-success">Email verified!</p>
          <p className="mt-2 text-sm text-muted">Redirecting to sign in...</p>
        </div>
      )}

      {mutation.isError && (
        <div className="animate-fade-in py-16 text-center">
          <XCircle size={48} className="mx-auto mb-6 text-error" />
          <p className="font-medium text-error">Invalid or expired verification link.</p>
          <LoadingButton
            variant="outline"
            className="mt-8"
            onClick={() => router.push(ROUTES.RESEND_VERIFICATION)}
          >
            Resend verification email
          </LoadingButton>
        </div>
      )}

      {!token && !mutation.isPending && (
        <div className="py-16 text-center">
          <XCircle size={48} className="mx-auto mb-6 text-zinc-300" />
          <p className="text-sm text-muted">No verification token provided.</p>
          <LoadingButton
            variant="outline"
            className="mt-8"
            onClick={() => router.push(ROUTES.RESEND_VERIFICATION)}
          >
            Resend verification email
          </LoadingButton>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <ThemeToggle />
      </div>
    </div>
  );
}
