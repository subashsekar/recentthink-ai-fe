'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { registerSchema, type RegisterFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      const { access_token, refresh_token, user } = response.data as unknown as {
        access_token: string;
        refresh_token: string;
        user: import('@/types/auth').User;
      };
      if (access_token && refresh_token) {
        login(access_token, refresh_token, user);
        toast.success('Account created successfully!');
        router.push(ROUTES.DASHBOARD);
      } else {
        toast.success('Account created! Please check your email to verify.');
        router.push(ROUTES.LOGIN);
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-white"
          >
            <Image
              src="/recentthink-logo.png"
              alt="RecentThink"
              width={28}
              height={28}
              className="dark:invert"
            />
            RecentThink
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-white">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Get started with RecentThink
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Full name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Create a password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordInput
            id="password_confirm"
            label="Confirm password"
            placeholder="Confirm your password"
            error={errors.password_confirm?.message}
            {...register('password_confirm')}
          />

          <Button type="submit" fullWidth isLoading={mutation.isPending}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link
            href={ROUTES.LOGIN}
            className="font-medium text-zinc-900 hover:underline dark:text-white"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
