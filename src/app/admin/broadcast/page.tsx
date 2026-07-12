'use client';

import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminApi } from '@/services/api/admin';
import type { BroadcastPayload, BroadcastType } from '@/types/admin';
import { getAxiosErrorMessage } from '@/utils/courseError';

const TYPES: BroadcastType[] = ['announcement', 'maintenance', 'emergency', 'info', 'warning'];

type FormValues = {
  title: string;
  message: string;
  type: BroadcastType;
};

export default function AdminBroadcastPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      message: '',
      type: 'announcement',
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: BroadcastPayload) => adminApi.broadcast(payload),
    onSuccess: () => {
      toast.success('Broadcast sent');
      reset({ title: '', message: '', type: 'announcement' });
    },
    onError: (err) => {
      toast.error(getAxiosErrorMessage(err, 'Failed to send broadcast'));
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Comms</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Broadcast
        </h1>
        <p className="mt-1 text-sm text-muted">
          Send an in-app notification to users via the Gateway
        </p>
      </div>

      <form
        onSubmit={handleSubmit((values) =>
          mutation.mutate({
            title: values.title.trim(),
            message: values.message.trim(),
            type: values.type,
          }),
        )}
        className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <Input
          id="broadcast_title"
          label="Title"
          placeholder="Maintenance window"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required' })}
        />

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Message</span>
          <textarea
            className="min-h-[140px] w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="We will be performing maintenance…"
            {...register('message', { required: 'Message is required' })}
          />
          {errors.message?.message ? (
            <span className="text-xs text-error">{errors.message.message}</span>
          ) : null}
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Type</span>
          <select
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
            {...register('type')}
          >
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <Button type="submit" className="rounded-xl" isLoading={mutation.isPending}>
          Send broadcast
        </Button>
      </form>
    </div>
  );
}
