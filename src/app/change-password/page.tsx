'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { changePasswordSchema, type ChangePasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully. Please sign in again.');
      logout();
      router.push(ROUTES.LOGIN);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(message);
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => mutation.mutate(data);

  return (
    <ProtectedRoute>
      <div className="mx-auto mt-10 max-w-md px-4">
        <Card>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Change Password</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your current password and a new password
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <PasswordInput
              id="current_password"
              label="Current password"
              placeholder="Enter current password"
              autoComplete="current-password"
              error={errors.current_password?.message}
              {...register('current_password')}
            />
            <PasswordInput
              id="new_password"
              label="New password"
              placeholder="Enter new password"
              autoComplete="new-password"
              error={errors.new_password?.message}
              {...register('new_password')}
            />
            <PasswordInput
              id="confirm_new_password"
              label="Confirm new password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              error={errors.confirm_new_password?.message}
              {...register('confirm_new_password')}
            />
            <LoadingButton type="submit" fullWidth isLoading={mutation.isPending}>
              Change password
            </LoadingButton>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
