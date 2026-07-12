import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

/** Legacy route — Change Password now lives in Account Security. */
export default function ChangePasswordRedirectPage() {
  redirect(ROUTES.ACCOUNT_SECURITY);
}
