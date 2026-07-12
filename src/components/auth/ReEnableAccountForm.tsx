'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { accountApi } from '@/services/api/account';
import { enableAccountSchema, type EnableAccountFormData } from '@/utils/validation';
import { getAxiosErrorMessage } from '@/utils/courseError';
import { ROUTES } from '@/constants';

export function ReEnableAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnableAccountFormData>({
    resolver: zodResolver(enableAccountSchema),
    defaultValues: { email: emailFromQuery, password: '' },
  });

  const mutation = useMutation({
    mutationFn: accountApi.enable,
    onSuccess: () => {
      toast.success('Account re-enabled. You can sign in now.');
      router.push(ROUTES.LOGIN);
    },
    onError: (err: unknown) => {
      toast.error(getAxiosErrorMessage(err, 'Could not re-enable account.'));
    },
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Re-enable account
      </h1>
      <p className="mt-2 text-sm text-muted">
        Enter your email and password to reactivate a disabled account.
      </p>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="mt-10 space-y-6">
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
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <LoadingButton type="submit" fullWidth isLoading={mutation.isPending}>
          Re-enable account
        </LoadingButton>
      </form>

      <p className="mt-10 text-center text-sm text-muted">
        Ready to sign in?{' '}
        <Link
          href={ROUTES.LOGIN}
          className="font-medium text-primary-text transition-all duration-200 hover:text-primary"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
