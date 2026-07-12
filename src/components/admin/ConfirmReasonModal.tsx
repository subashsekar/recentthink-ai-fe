'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export type ConfirmReasonAction = 'block' | 'unblock' | 'activate' | 'deactivate' | 'delete';

interface ConfirmReasonModalProps {
  open: boolean;
  action: ConfirmReasonAction | null;
  userLabel?: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

const COPY: Record<
  ConfirmReasonAction,
  { title: string; body: string; confirmLabel: string; danger?: boolean }
> = {
  block: {
    title: 'Block user',
    body: 'Force-lock this account. The user cannot log in or self-enable.',
    confirmLabel: 'Block',
    danger: true,
  },
  unblock: {
    title: 'Unblock user',
    body: 'Remove the admin block so the user can log in again (if still active).',
    confirmLabel: 'Unblock',
  },
  activate: {
    title: 'Activate user',
    body: 'Re-enable this disabled account.',
    confirmLabel: 'Activate',
  },
  deactivate: {
    title: 'Deactivate user',
    body: 'Disable this account. The user can re-enable themselves with password.',
    confirmLabel: 'Deactivate',
  },
  delete: {
    title: 'Delete user',
    body: 'Permanently delete this user. This cannot be undone.',
    confirmLabel: 'Delete forever',
    danger: true,
  },
};

export function ConfirmReasonModal({
  open,
  action,
  userLabel,
  isLoading,
  onClose,
  onConfirm,
}: ConfirmReasonModalProps) {
  const [reason, setReason] = useState('');

  if (!action) return null;
  const copy = COPY[action];

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        if (isLoading) return;
        setReason('');
        onClose();
      }}
      title={copy.title}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          {copy.body}
          {userLabel ? (
            <>
              {' '}
              Target: <strong className="text-foreground">{userLabel}</strong>
            </>
          ) : null}
        </p>

        <Input
          id="admin_action_reason"
          label="Reason (optional)"
          placeholder="Optional note for audit logs"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isLoading}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            disabled={isLoading}
            onClick={() => {
              setReason('');
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={copy.danger ? 'danger' : 'primary'}
            className="rounded-xl"
            isLoading={isLoading}
            onClick={() => onConfirm(reason.trim() || undefined)}
          >
            {copy.confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
