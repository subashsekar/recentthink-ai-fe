'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { authService } from '@/services/authService';
import { registerSchema, type RegisterFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('Account created! Please check your email to verify.');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    },
  });

  const onSubmit = (data: RegisterFormData) => mutation.mutate(data);

  if (mutation.isSuccess) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Check your email</h1>
        <p className="mt-2 text-sm text-muted">
          We&apos;ve sent a verification link to your email. Please check your inbox.
        </p>
        <div className="mt-10">
          <Link href={ROUTES.LOGIN}>
            <LoadingButton variant="outline" fullWidth>
              Go to sign in
            </LoadingButton>
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
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Create an account</h1>
      <p className="mt-2 text-sm text-muted">Get started with RecentThink</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="first_name"
            label="First name"
            placeholder="Jane"
            autoComplete="given-name"
            error={errors.first_name?.message}
            {...register('first_name')}
          />
          <Input
            id="last_name"
            label="Last name"
            placeholder="Doe"
            autoComplete="family-name"
            error={errors.last_name?.message}
            {...register('last_name')}
          />
        </div>

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          id="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="pt-2">
          <LoadingButton type="submit" fullWidth isLoading={mutation.isPending}>
            Create account
          </LoadingButton>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link
          href={ROUTES.LOGIN}
          className="font-medium text-primary-text transition-all duration-200 hover:text-primary"
        >
          Sign in
        </Link>
      </p>

      <div className="mt-10 flex items-center justify-center gap-3">
        <ThemeToggle />
        <span className="text-xs text-zinc-300">|</span>
        <span className="text-xs text-muted">Terms &amp; Privacy</span>
      </div>
    </div>
  );
}
