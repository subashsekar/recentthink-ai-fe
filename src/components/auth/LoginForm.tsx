'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Alert } from '@/components/ui/Alert';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { loginSchema, type LoginFormData } from '@/utils/validation';
import { getLoginAccountError } from '@/utils/authError';
import { ROUTES } from '@/constants';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [accountError, setAccountError] = useState<ReturnType<typeof getLoginAccountError> | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      setAccountError(null);
      const { access_token, refresh_token, user } = response;
      login(access_token, refresh_token, user);
      toast.success('Welcome back!');
      router.push(
        user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
          ? ROUTES.ADMIN_DASHBOARD
          : ROUTES.DASHBOARD,
      );
    },
    onError: (error: unknown) => {
      const parsed = getLoginAccountError(error);
      setAccountError(parsed);
      if (parsed.kind === 'other') {
        toast.error(parsed.message);
      }
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setAccountError(null);
    mutation.mutate(data);
  };

  const emailForReEnable = getValues('email') || '';

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Sign in to your account to continue</p>

      {accountError?.kind === 'blocked' && (
        <div className="mt-6">
          <Alert variant="error">{accountError.message}</Alert>
        </div>
      )}

      {accountError?.kind === 'disabled' && (
        <div className="mt-6 space-y-2">
          <Alert variant="warning">
            <span>
              Account disabled.{' '}
              <Link
                href={
                  emailForReEnable
                    ? `${ROUTES.RE_ENABLE_ACCOUNT}?email=${encodeURIComponent(emailForReEnable)}`
                    : ROUTES.RE_ENABLE_ACCOUNT
                }
                className="font-medium underline underline-offset-2"
              >
                Re-enable account
              </Link>
            </span>
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
        <div
          className="animate-slide-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div
          className="animate-slide-up"
          style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
        >
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div
          className="flex animate-fade-up justify-end"
          style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-sm text-muted transition-all duration-200 hover:text-primary-text"
          >
            Forgot password?
          </Link>
        </div>

        <div
          className="animate-fade-up pt-2"
          style={{ animationDelay: '0.25s', animationFillMode: 'both' }}
        >
          <LoadingButton type="submit" fullWidth isLoading={mutation.isPending}>
            Sign in
          </LoadingButton>
        </div>
      </form>

      <p
        className="mt-10 animate-fade-up text-center text-sm text-muted"
        style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
      >
        Don&apos;t have an account?{' '}
        <Link
          href={ROUTES.REGISTER}
          className="font-medium text-primary-text transition-all duration-200 hover:text-primary"
        >
          Sign up
        </Link>
      </p>

      <div
        className="mt-10 flex animate-fade-up items-center justify-center gap-3"
        style={{ animationDelay: '0.35s', animationFillMode: 'both' }}
      >
        <ThemeToggle />
        <span className="text-xs text-zinc-300">|</span>
        <span className="text-xs text-muted">Terms &amp; Privacy</span>
      </div>
    </div>
  );
}
