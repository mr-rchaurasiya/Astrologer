import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSubscriptionSummary } from '../types/subscription';
import { ApiClient } from '../services/api';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  subscription: UserSubscriptionSummary | null;
  isPremium: boolean;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  upgradeToPremium: (durationDays?: number) => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscriptionSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const res = await ApiClient.getMySubscription();
      if (res.success && res.data) {
        setSubscription(res.data);
      }
    } catch {
      // Silently handle fallback
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  const upgradeToPremium = async (durationDays = 30): Promise<boolean> => {
    try {
      const res = await ApiClient.upgradeSubscription({
        plan: 'premium',
        durationDays,
      });
      if (res.success && res.data) {
        setSubscription(res.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const isPremium = subscription ? subscription.isPremium : false;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isPremium,
        loading,
        refreshSubscription,
        upgradeToPremium,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
