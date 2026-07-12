'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ban, ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DisableAccountDialog } from '@/components/profile/DisableAccountDialog';
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog';

export function DangerZoneCard() {
  const [disableOpen, setDisableOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="profile-panel space-y-8 rounded-2xl border border-border p-6 sm:p-8"
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Account Management
          </h2>
          <p className="mt-1 text-sm text-muted">
            Control account availability and permanent deletion.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Account Status
            </p>
            <p className="mt-1 text-sm text-muted">
              Temporarily pause access while keeping your data.
            </p>
          </div>
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 transition hover:border-amber-400/50 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-amber-400" />
                  <p className="text-sm font-semibold text-foreground">Disable Account</p>
                </div>
                <p className="max-w-2xl text-sm text-muted">
                  Temporarily disable your account. Your profile and learning data will be
                  preserved. You can re-enable later from the re-enable account page.
                </p>
              </div>
              <Button
                type="button"
                className="shrink-0 rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                onClick={() => setDisableOpen(true)}
              >
                Disable Account
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-red-400/20 pt-8">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-400/25 bg-red-500/10 text-error">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-error/80">
                Danger Zone
              </p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Delete Account</h3>
              <p className="mt-1 text-sm text-muted">
                Irreversible actions that permanently remove your account.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-red-400/25 bg-red-500/5 p-4 transition hover:border-red-400/45 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-error" />
                  <p className="text-sm font-semibold text-foreground">Delete Account</p>
                </div>
                <p className="max-w-2xl text-sm text-muted">
                  Permanently delete your account and all associated learning history. This action
                  cannot be undone.
                </p>
              </div>
              <Button
                type="button"
                variant="danger"
                className="shrink-0 rounded-xl"
                onClick={() => setDeleteOpen(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      <DisableAccountDialog open={disableOpen} onClose={() => setDisableOpen(false)} />
      <DeleteAccountDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </>
  );
}
