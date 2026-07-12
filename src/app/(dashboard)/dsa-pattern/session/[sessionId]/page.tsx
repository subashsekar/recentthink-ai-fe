'use client';

import { use } from 'react';
import { PatternAgentPage } from '@/components/dsa-pattern/PatternAgentPage';

export default function DsaPatternSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  return <PatternAgentPage sessionId={sessionId} />;
}
