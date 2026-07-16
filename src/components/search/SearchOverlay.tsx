'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  glass?: boolean;
}

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function SearchOverlay({ open, onClose, glass = false }: SearchOverlayProps) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="command-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className={cn(
            'fixed inset-0 z-[60]',
            glass ? 'glass-overlay' : 'bg-black/25 backdrop-blur-[2px] dark:bg-black/40',
          )}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
