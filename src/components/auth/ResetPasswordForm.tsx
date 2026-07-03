'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { authService } from '@/services/authService';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) });

  const mutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully!');
      router.push(ROUTES.LOGIN);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }
    mutation.mutate({ token, new_password: data.new_password });
  };

  if (!token) {
    return (
      <div className="animate-fade-in">
        <div className="space-y-6 text-center">
          <p className="text-sm text-error">Invalid or missing reset token.</p>
          <LoadingButton variant="outline" onClick={() => router.push(ROUTES.FORGOT_PASSWORD)}>
            Request new reset link
          </LoadingButton>
        </div>
        <div className="mt-10 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Reset your password</h1>
      <p className="mt-2 text-sm text-muted">Enter your new password below</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
        <PasswordInput
          id="new_password"
          label="New password"
          placeholder="Enter new password"
          autoComplete="new-password"
          error={errors.new_password?.message}
          {...register('new_password')}
        />
        <div className="pt-2">
          <LoadingButton type="submit" fullWidth isLoading={mutation.isPending}>
            Reset password
          </LoadingButton>
        </div>
      </form>

      <div className="mt-10 flex justify-center">
        <ThemeToggle />
      </div>
    </div>
  );
}
