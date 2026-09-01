export interface AdminOverviewData {
  users: {
    total: number;
    active: number;
    deactivated: number;
  };
  subscriptions: {
    premiumActive: number;
    free: number;
  };
  payments: {
    totalOrders: number;
    successfulOrders: number;
    totalRevenueUSD: string;
    currency: string;
  };
  reports: {
    totalGenerated: number;
  };
  aiUsageRecords: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminSubscription {
  id: string;
  userId: {
    id: string;
    name: string;
    email: string;
  };
  plan: 'free' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  startedAt: string;
  expiresAt?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}
