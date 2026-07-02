'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';

export default function ResendVerificationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: () => {
      toast.success('Verification email sent!');
    },
    onError: () => {
      toast.success('If an account with that email exists, a verification email has been sent.');
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href={ROUTES.HOME} className="text-2xl font-bold text-zinc-900 dark:text-white">
            RecentThink
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-white">
            Resend verification
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your email to receive a new verification link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" fullWidth isLoading={mutation.isPending}>
            Send verification email
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href={ROUTES.LOGIN}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
