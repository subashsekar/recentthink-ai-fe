'use client';

import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AccountActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg';
  preventClose?: boolean;
}

export function AccountActionDialog({
  open,
  onClose,
  title,
  children,
  size = 'md',
  preventClose = false,
}: AccountActionDialogProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose, preventClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!preventClose) onClose();
            }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-action-dialog-title"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative z-10 w-full rounded-2xl border border-border bg-[rgba(10,20,36,0.95)] p-6 shadow-2xl backdrop-blur-xl sm:p-7',
              size === 'lg' ? 'max-w-xl' : 'max-w-lg',
            )}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <h2
                id="account-action-dialog-title"
                className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={preventClose}
                className="rounded-lg p-1.5 text-muted transition hover:bg-secondary-bg hover:text-foreground disabled:opacity-40"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
