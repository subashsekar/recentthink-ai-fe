'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { changePasswordSchema, type ChangePasswordFormData } from '@/utils/validation';
import { getAxiosErrorMessage } from '@/utils/courseError';
import { ROUTES } from '@/constants';

export function ChangePasswordSection() {
  const { logout } = useAuthStore();
  const router = useRouter();

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
      toast.error(getAxiosErrorMessage(error, 'Failed to change password'));
    },
  });

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">Change Password</h2>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
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
  );
}
