import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../../context/SubscriptionContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Lock, Sparkles, Zap } from 'lucide-react';

interface PremiumGuardProps {
  children: React.ReactNode;
  featureName?: string;
  fallbackMessage?: string;
  requirePremium?: boolean;
}

export const PremiumGuard: React.FC<PremiumGuardProps> = ({
  children,
  featureName = 'Advanced Analytics',
  fallbackMessage = 'Upgrade to Cosmic Premium to unlock multi-decade high-resolution insights and expanded AI consultation quotas.',
  requirePremium = true,
}) => {
  const { isPremium, loading, upgradeToPremium } = useSubscription();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Checking subscription status...</div>;
  }

  if (isPremium || !requirePremium) {
    return <>{children}</>;
  }

  return (
    <Card
      glow
      style={{
        position: 'relative',
        textAlign: 'center',
        padding: '48px 24px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(13, 17, 24, 0.98) 0%, rgba(20, 15, 35, 0.98) 100%)',
        border: '1px solid var(--border-gold)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
          border: '1px solid var(--border-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          color: 'var(--accent-gold)',
        }}
      >
        <Lock size={24} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{featureName}</h3>
        <Badge variant="gold">Premium Tier</Badge>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
        {fallbackMessage}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <Link to="/subscription" className="btn btn-gold" style={{ padding: '10px 22px' }}>
          <Sparkles size={16} /> View Subscription Plans
        </Link>
        <Button
          variant="outline"
          onClick={() => upgradeToPremium(30)}
          style={{ padding: '10px 18px', borderColor: '#818CF8', color: '#818CF8' }}
        >
          <Zap size={15} /> Instant 30-Day Trial
        </Button>
      </div>
    </Card>
  );
};
