import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

/** Alias for public profiles: /profile/{username} → /u/{username} */
export default async function ProfileUsernameAliasPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  redirect(ROUTES.PUBLIC_PROFILE(username));
}
