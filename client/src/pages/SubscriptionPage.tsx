import React, { useState, useEffect } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { PaymentApi } from '../services/paymentApi';
import { SubscriptionPlanDefinition, PaymentRecord } from '../types/payments';
import { PaymentModal } from '../components/subscription/PaymentModal';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Sparkles, Check, Zap, Lock, Star, History, XCircle, Loader2 } from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const { subscription, isPremium, refreshSubscription } = useSubscription();
  const [plans, setPlans] = useState<SubscriptionPlanDefinition[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlanDefinition | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);
  const [couponDiscount, setCouponDiscount] = useState<any>(null);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setMessage(null);
    try {
      const { CouponApi } = await import('../services/couponApi');
      const targetPlanId = billingPeriod === 'yearly' ? 'pro_annual' : 'pro_monthly';
      const res = await CouponApi.validate(couponCode.trim(), targetPlanId);
      if (res.success && res.data?.valid) {
        setCouponDiscount(res.data);
      } else {
        setCouponDiscount(null);
        setMessage(res.data?.message || 'Invalid or expired promo code');
      }
    } catch (err: any) {
      setCouponDiscount(null);
      setMessage(err.message || 'Error validating coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  useEffect(() => {
    const loadSubscriptionData = async () => {
      setLoading(true);
      try {
        const [plansRes, historyRes] = await Promise.all([
          PaymentApi.getPlans(),
          PaymentApi.getPaymentHistory().catch(() => ({ success: false, data: { payments: [] } })),
        ]);

        if (plansRes.success && plansRes.data) {
          setPlans(plansRes.data.plans);
        }

        if (historyRes.success && historyRes.data) {
          setPayments(historyRes.data.payments);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionData();
  }, []);

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your Cosmic Premium subscription?')) {
      return;
    }

    setCancelling(true);
    setMessage(null);
    try {
      const res = await PaymentApi.cancelSubscription();
      if (res.success) {
        setMessage('Subscription cancelled. You now have the standard Seeker Free tier.');
        await refreshSubscription();
      }
    } catch {
      setMessage('Failed to cancel subscription.');
    } finally {
      setCancelling(false);
    }
  };

  const activePremiumPlan = plans.find(
    (p) => p.tier === 'premium' && p.billingPeriod === billingPeriod
  ) || plans.find((p) => p.tier === 'premium') || {
    planId: billingPeriod === 'yearly' ? 'premium_yearly' : 'premium_monthly',
    name: billingPeriod === 'yearly' ? 'Cosmic Premium Annual' : 'Cosmic Premium Monthly',
    tier: 'premium',
    price: billingPeriod === 'yearly' ? 14900 : 1900,
    displayPrice: billingPeriod === 'yearly' ? 149 : 19,
    currency: 'USD',
    billingPeriod,
    active: true,
    features: [
      '100 AI Consultations per day',
      '20 Personalized Daily Insights per day',
      'Full 80-Year Life Curve Trajectory',
      '730-Day Transit Timeline',
      'Unlimited PDF Horoscope Reports',
      'Voice AI Consultation Access',
    ],
    limits: {},
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--accent-gold)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading subscription plans and billing details...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 16px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(245, 208, 97, 0.08)', border: '1px solid var(--border-gold)', marginBottom: '16px' }}>
          <Sparkles size={15} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)' }}>Cosmic Subscriptions & Billing</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '10px' }}>
          Elevate Your Astrological Journey
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
          Multi-decade Life Curve trajectories, extended Gochar transit timeline, vector PDF reports, and priority AI consultation.
        </p>

        {/* Billing Period Toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '30px', border: '1px solid var(--border-medium)', marginTop: '24px' }}>
          <button
            onClick={() => setBillingPeriod('monthly')}
            style={{
              padding: '8px 20px',
              borderRadius: '24px',
              border: 'none',
              cursor: 'pointer',
              background: billingPeriod === 'monthly' ? 'var(--accent-gold)' : 'transparent',
              color: billingPeriod === 'monthly' ? '#07090E' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            style={{
              padding: '8px 20px',
              borderRadius: '24px',
              border: 'none',
              cursor: 'pointer',
              background: billingPeriod === 'yearly' ? 'var(--accent-gold)' : 'transparent',
              color: billingPeriod === 'yearly' ? '#07090E' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Annual</span>
            <span style={{ fontSize: '0.65rem', background: '#10B981', color: '#FFF', padding: '2px 6px', borderRadius: '10px' }}>
              Save 35%
            </span>
          </button>
        </div>

        {/* Promo Coupon Code Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Have a Promo Code / Coupon?"
            style={{
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: '#FFF',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              outline: 'none',
              minWidth: '220px',
            }}
          />
          <Button variant="outline" size="sm" onClick={handleValidateCoupon} disabled={validatingCoupon || !couponCode.trim()}>
            {validatingCoupon ? 'Checking...' : 'Apply Coupon'}
          </Button>
        </div>

        {couponDiscount && (
          <div style={{ marginTop: '10px', fontSize: '0.825rem', color: '#10B981', fontWeight: 600 }}>
            ✓ Coupon {couponDiscount.code} applied! Enjoy {couponDiscount.discountType === 'percentage' ? `${couponDiscount.discountValue}% OFF` : `₹${couponDiscount.discountValue} OFF`} at checkout.
          </div>
        )}
      </div>

      {/* Notification Banner */}
      {message && (
        <div style={{ maxWidth: '860px', margin: '0 auto 24px auto', padding: '12px 18px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6EE7B7', textAlign: 'center', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      {/* Quota / Current Status Card */}
      {subscription && (
        <div
          className="glass-panel"
          style={{
            maxWidth: '860px',
            margin: '0 auto 36px auto',
            padding: '20px 24px',
            borderRadius: '14px',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Status:</span>
              <Badge variant={isPremium ? 'gold' : 'indigo'}>{subscription.plan.toUpperCase()}</Badge>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Daily AI Consultations: {subscription.usageToday.aiChatUsed} / {subscription.usageToday.aiChatLimit} used • Daily Insights: {subscription.usageToday.dailyInsightsUsed} / {subscription.usageToday.dailyInsightsLimit} used
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isPremium ? (
              <Button variant="outline" onClick={handleCancelSubscription} disabled={cancelling} style={{ color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Cancel Plan
              </Button>
            ) : (
              <Button variant="gold" onClick={() => setSelectedPlanForPayment(activePremiumPlan)}>
                <Zap size={15} /> Upgrade to Cosmic Premium
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '860px', margin: '0 auto 48px auto' }}>
        {/* Free Plan */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: isPremium ? 0.75 : 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Seeker Free</h3>
              <Badge variant="indigo">Standard</Badge>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
              $0 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ forever</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Essential Vedic calculations, daily panchang, and introductory AI queries.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#34D399" /> 5 AI Consultations / day</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#34D399" /> 1 Personalized Daily Insight / day</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="#34D399" /> Full D1, D9, D10 Kundli Charts</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}><Lock size={15} /> 30-Year Life Curve Horizon</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}><Lock size={15} /> 1 PDF Report / month</li>
            </ul>
          </div>

          <div style={{ marginTop: '28px' }}>
            <div style={{ textAlign: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {!isPremium ? 'Currently Active' : 'Free Base Tier'}
            </div>
          </div>
        </Card>

        {/* Cosmic Premium Plan */}
        <Card
          glow
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid var(--border-gold)',
            background: 'linear-gradient(135deg, rgba(13, 17, 24, 0.98) 0%, rgba(25, 20, 42, 0.98) 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={18} fill="var(--accent-gold)" color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Cosmic Premium</h3>
              </div>
              <Badge variant="gold">{billingPeriod === 'yearly' ? 'Best Value' : 'Popular'}</Badge>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '6px' }}>
              ${activePremiumPlan.displayPrice}{' '}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                / {billingPeriod === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Unrestricted 80-year life curve analytics, multi-year transits, and priority Voice & AI consultation.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--accent-gold)" /> <strong>100 AI Consultations / day</strong></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--accent-gold)" /> <strong>20 Daily AI Insights / day</strong></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--accent-gold)" /> <strong>Full 80-Year Life Curve</strong></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--accent-gold)" /> <strong>Unlimited PDF Horoscope Reports</strong></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={16} color="var(--accent-gold)" /> Voice AI Consultation Access</li>
            </ul>
          </div>

          <div style={{ marginTop: '28px' }}>
            <Button
              variant="gold"
              onClick={() => setSelectedPlanForPayment(activePremiumPlan)}
              disabled={isPremium}
              style={{ width: '100%' }}
            >
              {isPremium ? 'Active Plan (Cosmic Premium)' : `Upgrade for $${activePremiumPlan.displayPrice}`}
            </Button>
          </div>
        </Card>
      </div>

      {/* Payment History Table */}
      {payments.length > 0 && (
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <History size={18} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Payment & Billing Records</h3>
          </div>

          <Card>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 14px' }}>Date</th>
                    <th style={{ padding: '10px 14px' }}>Order ID</th>
                    <th style={{ padding: '10px 14px' }}>Amount</th>
                    <th style={{ padding: '10px 14px' }}>Plan</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#60A5FA', fontFamily: 'monospace' }}>
                        {p.providerOrderId}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#FFF' }}>
                        ${(p.amount / 100).toFixed(2)} {p.currency}
                      </td>
                      <td style={{ padding: '12px 14px' }}>{p.planId}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <Badge variant={p.status === 'captured' ? 'emerald' : p.status === 'failed' ? 'rose' : 'indigo'}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {selectedPlanForPayment && (
        <PaymentModal
          plan={selectedPlanForPayment}
          onClose={() => setSelectedPlanForPayment(null)}
          onSuccess={async () => {
            await refreshSubscription();
          }}
        />
      )}
    </div>
  );
};
