'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Alert } from '@/components/ui/Alert';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { loginSchema, type LoginFormData } from '@/utils/validation';
import { getLoginAccountError } from '@/utils/authError';
import { ROUTES } from '@/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [accountError, setAccountError] = useState<ReturnType<typeof getLoginAccountError> | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: authService.adminLogin,
    onSuccess: (response) => {
      setAccountError(null);
      const { access_token, refresh_token, admin } = response;
      login(access_token, refresh_token, admin);
      toast.success('Welcome back, admin!');
      router.push(ROUTES.ADMIN_DASHBOARD);
    },
    onError: (error: unknown) => {
      const parsed = getLoginAccountError(error);
      setAccountError(parsed);
      if (parsed.kind === 'other') {
        toast.error(parsed.message);
      }
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            RecentThink
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground">Admin</h1>
          <p className="mt-2 text-sm text-muted">Sign in with your admin account</p>
        </div>

        {accountError?.kind === 'blocked' && (
          <div className="mb-4">
            <Alert variant="error">{accountError.message}</Alert>
          </div>
        )}

        {accountError?.kind === 'disabled' && (
          <div className="mb-4">
            <Alert variant="warning">
              Account disabled. Contact a super admin to restore access.
            </Alert>
          </div>
        )}

        <form
          onSubmit={handleSubmit((data) => {
            setAccountError(null);
            mutation.mutate(data);
          })}
          className="space-y-4"
        >
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="admin@example.com"
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
            Sign in
          </LoadingButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href={ROUTES.LOGIN} className="hover:text-foreground">
            Back to user login
          </Link>
        </p>
      </div>
    </div>
  );
}
