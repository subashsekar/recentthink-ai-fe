'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { AccountActionDialog } from '@/components/profile/AccountActionDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { accountApi } from '@/services/api/account';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';
import { getAxiosErrorMessage } from '@/utils/courseError';
import { disableAccountSchema, type DisableAccountFormData } from '@/utils/validation';

interface DisableAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DisableAccountDialog({ open, onClose }: DisableAccountDialogProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const userEmail = useAuthStore((s) => s.user?.email);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<DisableAccountFormData>({
    resolver: zodResolver(disableAccountSchema),
    defaultValues: { password: '', confirm_text: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (open) reset({ password: '', confirm_text: '' });
  }, [open, reset]);

  const password = watch('password');
  const confirmText = watch('confirm_text');
  const canSubmit = Boolean(password?.trim()) && confirmText?.trim() === 'DISABLE';

  const mutation = useMutation({
    mutationFn: (data: DisableAccountFormData) => accountApi.disable({ password: data.password }),
    onSuccess: () => {
      toast.success('Your account has been disabled.');
      const email = userEmail ?? '';
      logout();
      router.replace(
        email
          ? `${ROUTES.RE_ENABLE_ACCOUNT}?email=${encodeURIComponent(email)}`
          : ROUTES.RE_ENABLE_ACCOUNT,
      );
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400 || status === 401 || status === 403) {
          setError('password', {
            message: getAxiosErrorMessage(err, 'Incorrect password'),
          });
          return;
        }
      }
      toast.error(getAxiosErrorMessage(err, 'Could not disable account. Please try again.'));
    },
  });

  return (
    <AccountActionDialog
      open={open}
      onClose={onClose}
      title="Disable Account"
      preventClose={mutation.isPending}
    >
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
        <div className="space-y-2 text-sm text-muted">
          <p>Temporarily disable your account while preserving all user data.</p>
          <ul className="list-disc space-y-1 pl-5 text-secondary-text">
            <li>Prevent future logins until reactivation</li>
            <li>Revoke active sessions</li>
            <li>Pause AI usage</li>
            <li>Keep your profile and learning data preserved</li>
          </ul>
        </div>

        <PasswordInput
          id="disable_password"
          label="Password"
          autoComplete="current-password"
          className="h-12 rounded-xl"
          error={errors.password?.message}
          disabled={mutation.isPending}
          {...register('password')}
        />

        <Input
          id="disable_confirm_text"
          label="Type DISABLE to confirm"
          placeholder="DISABLE"
          className="h-12 rounded-xl font-mono tracking-wide"
          error={errors.confirm_text?.message}
          disabled={mutation.isPending}
          autoComplete="off"
          {...register('confirm_text')}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-xl bg-amber-500 text-white hover:bg-amber-600"
            isLoading={mutation.isPending}
            disabled={!canSubmit || mutation.isPending}
          >
            Disable Account
          </Button>
        </div>
      </form>
    </AccountActionDialog>
  );
}
