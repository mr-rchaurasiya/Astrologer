export type NotificationType =
  | 'daily_insight'
  | 'transit'
  | 'subscription'
  | 'payment'
  | 'report'
  | 'system';

export interface InAppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  id?: string;
  userId: string;
  dailyInsight: boolean;
  transitEvents: boolean;
  subscription: boolean;
  payment: boolean;
  report: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}
