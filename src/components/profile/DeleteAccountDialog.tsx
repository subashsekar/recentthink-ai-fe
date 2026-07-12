'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { AlertTriangle } from 'lucide-react';
import { AccountActionDialog } from '@/components/profile/AccountActionDialog';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { accountApi } from '@/services/api/account';
import { useAuthStore } from '@/store/authStore';
import { storage } from '@/utils/storage';
import { ROUTES } from '@/constants';
import { getAxiosErrorMessage } from '@/utils/courseError';
import { deleteAccountSchema, type DeleteAccountFormData } from '@/utils/validation';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

const DELETE_IMPACTS = [
  'Profile',
  'AI Chat History',
  'LeetCode Sessions',
  'HackerRank Sessions',
  'Course History',
  'Learning Progress',
  'Usage Statistics',
  'API Keys',
  'Saved Preferences',
];

export function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [finalConfirmOpen, setFinalConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<DeleteAccountFormData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: '', confirm: false },
    mode: 'onChange',
  });

  useEffect(() => {
    if (open) {
      reset({ password: '', confirm: false });
      setFinalConfirmOpen(false);
      setPendingPayload(null);
    }
  }, [open, reset]);

  const password = watch('password');
  const confirm = watch('confirm');
  const canContinue = Boolean(password?.trim()) && confirm === true;

  const mutation = useMutation({
    mutationFn: (data: DeleteAccountFormData) =>
      accountApi.delete({ password: data.password, confirm: true }),
    onSuccess: () => {
      toast.success('Your account has been permanently deleted.');
      logout();
      storage.clear();
      router.replace(ROUTES.HOME);
    },
    onError: (err: unknown) => {
      setFinalConfirmOpen(false);
      setPendingPayload(null);
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400 || status === 401 || status === 403) {
          setError('password', {
            message: getAxiosErrorMessage(err, 'Incorrect password'),
          });
          return;
        }
      }
      toast.error(getAxiosErrorMessage(err, 'Could not delete account. Please try again.'));
    },
  });

  const onFirstStep = (data: DeleteAccountFormData) => {
    setPendingPayload(data);
    setFinalConfirmOpen(true);
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    setFinalConfirmOpen(false);
    setPendingPayload(null);
    onClose();
  };

  return (
    <>
      <AccountActionDialog
        open={open && !finalConfirmOpen}
        onClose={handleClose}
        title="Delete Account"
        size="lg"
        preventClose={mutation.isPending}
      >
        <form onSubmit={handleSubmit(onFirstStep)} className="space-y-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/15 text-error">
              <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </div>
            <p className="text-sm text-muted">
              Permanently delete the account and all associated data. Deleting your account will
              permanently remove:
            </p>
          </div>

          <ul className="grid gap-1.5 rounded-xl border border-red-400/20 bg-red-500/5 p-4 text-sm text-secondary-text sm:grid-cols-2">
            {DELETE_IMPACTS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-error/80" />
                {item}
              </li>
            ))}
          </ul>

          <PasswordInput
            id="delete_password"
            label="Password"
            autoComplete="current-password"
            className="h-12 rounded-xl"
            error={errors.password?.message}
            disabled={mutation.isPending}
            {...register('password')}
          />

          <div className="space-y-1">
            <Checkbox
              id="delete_confirm"
              label="I understand this action is permanent and cannot be undone"
              checked={confirm}
              disabled={mutation.isPending}
              onChange={(e) => setValue('confirm', e.target.checked, { shouldValidate: true })}
            />
            {errors.confirm?.message && (
              <p className="text-xs text-error">{errors.confirm.message}</p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="rounded-xl"
              disabled={!canContinue || mutation.isPending}
            >
              Continue
            </Button>
          </div>
        </form>
      </AccountActionDialog>

      <AccountActionDialog
        open={finalConfirmOpen}
        onClose={() => {
          if (mutation.isPending) return;
          setFinalConfirmOpen(false);
          setPendingPayload(null);
        }}
        title="Final confirmation"
        preventClose={mutation.isPending}
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-red-400/25 bg-red-500/10 p-4">
            <p className="text-sm leading-relaxed text-secondary-text">
              This is your last chance to cancel. Your account and all learning data will be
              permanently deleted and cannot be recovered.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              disabled={mutation.isPending}
              onClick={() => {
                setFinalConfirmOpen(false);
                setPendingPayload(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="rounded-xl"
              isLoading={mutation.isPending}
              disabled={!pendingPayload || mutation.isPending}
              onClick={() => {
                if (pendingPayload) mutation.mutate(pendingPayload);
              }}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </AccountActionDialog>
    </>
  );
}
