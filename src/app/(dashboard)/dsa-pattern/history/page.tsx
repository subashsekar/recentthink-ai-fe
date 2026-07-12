import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

export default function DsaPatternHistoryRedirect() {
  redirect(ROUTES.DSA_PATTERN);
}
