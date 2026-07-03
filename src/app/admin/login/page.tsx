'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { loginSchema, type LoginFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: authService.adminLogin,
    onSuccess: (response) => {
      const { access_token, refresh_token, admin } = response;
      login(access_token, refresh_token, admin);
      toast.success('Welcome back, admin!');
      router.push(ROUTES.ADMIN_DASHBOARD);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Invalid credentials';
      toast.error(message);
    },
  });

  const onSubmit = (data: LoginFormData) => mutation.mutate(data);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in with your admin account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
      </div>
    </div>
  );
}
