'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordStrengthMeter } from '@/components/settings/PasswordStrengthMeter';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { getAxiosErrorMessage } from '@/utils/courseError';
import { changePasswordSchema, type ChangePasswordFormData } from '@/utils/validation';
import { ROUTES } from '@/constants';

export function ChangePasswordCard() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    },
  });

  const newPassword = watch('new_password') ?? '';

  const mutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully. Please sign in again.');
      logout();
      router.replace(ROUTES.LOGIN);
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error, 'Failed to change password'));
    },
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="profile-panel rounded-2xl border border-border p-6 sm:p-8"
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Change password
          </h2>
          <p className="mt-1 text-sm text-muted">
            Use a strong password you don’t reuse on other sites.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="grid gap-5 lg:grid-cols-2"
      >
        <div className="space-y-4">
          <PasswordInput
            id="current_password"
            label="Current password"
            placeholder="Enter current password"
            autoComplete="current-password"
            className="h-12 rounded-xl"
            error={errors.current_password?.message}
            disabled={mutation.isPending}
            {...register('current_password')}
          />
          <PasswordInput
            id="new_password"
            label="New password"
            placeholder="Enter new password"
            autoComplete="new-password"
            className="h-12 rounded-xl"
            error={errors.new_password?.message}
            disabled={mutation.isPending}
            {...register('new_password')}
          />
          <PasswordInput
            id="confirm_new_password"
            label="Confirm new password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="h-12 rounded-xl"
            error={errors.confirm_new_password?.message}
            disabled={mutation.isPending}
            {...register('confirm_new_password')}
          />
        </div>

        <div className="rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
          <PasswordStrengthMeter password={newPassword} />
        </div>

        <div className="flex flex-wrap gap-2 lg:col-span-2">
          <Button
            type="submit"
            className="rounded-xl px-6"
            isLoading={mutation.isPending}
            disabled={!isDirty}
          >
            Update password
          </Button>
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              disabled={mutation.isPending}
              onClick={() => reset()}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </motion.section>
  );
}
