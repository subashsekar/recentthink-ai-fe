'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { authService } from '@/services/authService';
import { changePasswordSchema, type ChangePasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage your account settings
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={`${user?.first_name || ''} ${user?.last_name || ''}`} size="lg" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {user?.first_name} {user?.last_name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={user?.is_verified ? 'success' : 'warning'}>
                {user?.is_verified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge>{user?.role}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          Change Password
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" isLoading={mutation.isPending}>
            Change password
          </Button>
        </form>
      </Card>
    </div>
  );
}
