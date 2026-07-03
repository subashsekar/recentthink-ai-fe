'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { authService } from '@/services/authService';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';

export function ResendVerificationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

  const mutation = useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: () => toast.success('Verification email sent!'),
    onError: () =>
      toast.success('If an account with that email exists, a verification email has been sent.'),
  });

  const onSubmit = (data: ForgotPasswordFormData) => mutation.mutate(data);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Resend verification</h1>
      <p className="mt-2 text-sm text-muted">Enter your email to receive a new verification link</p>

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
            Send verification email
          </LoadingButton>
        </div>
      </form>

      <div className="mt-8 text-center">
        <Link
          href={ROUTES.LOGIN}
          className="text-sm text-muted transition-all duration-200 hover:text-primary-text"
        >
          Back to sign in
        </Link>
      </div>

      <div className="mt-10 flex justify-center">
        <ThemeToggle />
      </div>
    </div>
  );
}
