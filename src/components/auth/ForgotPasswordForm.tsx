'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { authService } from '@/services/authService';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  const mutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () =>
      toast.success('If an account with that email exists, we have sent a password reset link.'),
    onError: () =>
      toast.success('If an account with that email exists, we have sent a password reset link.'),
  });

  const onSubmit = (data: ForgotPasswordFormData) => mutation.mutate(data);

  if (mutation.isSuccess) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          If an account with that email exists, we have sent a password reset link.
        </p>
        <div className="mt-10">
          <LoadingButton variant="outline" onClick={() => mutation.reset()} fullWidth>
            Send again
          </LoadingButton>
        </div>
        <div className="mt-8 text-center">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-all duration-200 hover:text-primary-text"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
        <div className="mt-10 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Forgot password?</h1>
      <p className="mt-2 text-sm text-muted">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="pt-2">
          <LoadingButton type="submit" fullWidth isLoading={mutation.isPending}>
            Send reset link
          </LoadingButton>
        </div>
      </form>

      <div className="mt-8 text-center">
        <Link
          href={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-all duration-200 hover:text-primary-text"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>

      <div className="mt-10 flex justify-center">
        <ThemeToggle />
      </div>
    </div>
  );
}
