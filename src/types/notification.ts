export type NotificationType =
  'announcement' | 'maintenance' | 'emergency' | 'info' | 'warning' | string;

export type NotificationItem = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
};

export type NotificationsQuery = {
  page?: number;
  page_size?: number;
  unread_only?: boolean;
};

export type NotificationsResponse = {
  items: NotificationItem[];
  total: number;
  page: number;
  page_size: number;
  unread_count?: number;
};
