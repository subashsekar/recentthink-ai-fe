'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully!');
      router.push(ROUTES.LOGIN);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      toast.error(message);
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }
    mutation.mutate({ ...data, token });
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-500">Invalid or missing reset token.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(ROUTES.FORGOT_PASSWORD)}
        >
          Request new reset link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <PasswordInput
        id="password"
        label="New password"
        placeholder="Enter new password"
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordInput
        id="password_confirm"
        label="Confirm password"
        placeholder="Confirm new password"
        error={errors.password_confirm?.message}
        {...register('password_confirm')}
      />
      <Button type="submit" fullWidth isLoading={mutation.isPending}>
        Reset password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your new password below
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-sm text-zinc-500">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
