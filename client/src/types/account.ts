import { User } from './index';

export interface AccountStats {
  profileCount: number;
  sessionCount: number;
  reportCount: number;
}

export interface AccountDetails {
  user: User;
  stats: AccountStats;
  subscription: {
    plan: string;
    status: string;
    expiresAt?: string;
  };
  preferences: {
    emailEnabled: boolean;
    inAppEnabled: boolean;
    dailyInsight: boolean;
    transitEvents: boolean;
  };
}
