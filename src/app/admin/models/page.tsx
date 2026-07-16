'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { Spinner } from '@/components/ui/Spinner';

export default function LegacyModelsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(ROUTES.ADMIN_AI_USAGE_MODELS);
  }, [router]);
  return (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  );
}
