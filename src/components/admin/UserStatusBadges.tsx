import { Badge } from '@/components/ui/Badge';
import type { AdminUser } from '@/types/admin';

interface UserStatusBadgesProps {
  user: Pick<AdminUser, 'is_active' | 'is_blocked' | 'is_verified'>;
}

export function UserStatusBadges({ user }: UserStatusBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {user.is_blocked ? (
        <Badge variant="error">Blocked</Badge>
      ) : (
        <Badge variant="default">Not blocked</Badge>
      )}
      {!user.is_active ? (
        <Badge variant="warning">Disabled</Badge>
      ) : (
        <Badge variant="success">Active</Badge>
      )}
      {user.is_verified ? (
        <Badge variant="info">Verified</Badge>
      ) : (
        <Badge variant="default">Unverified</Badge>
      )}
    </div>
  );
}
