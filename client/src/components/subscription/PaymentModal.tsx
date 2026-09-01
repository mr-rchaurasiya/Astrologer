import React, { useState } from 'react';
import { SubscriptionPlanDefinition } from '../../types/payments';
import { PaymentApi } from '../../services/paymentApi';
import { useSubscription } from '../../context/SubscriptionContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { X, Sparkles, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  plan: SubscriptionPlanDefinition;
  onClose: () => void;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onSuccess }) => {
  const { refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    setStatusText('Creating secure order on server...');

    try {
      // 1. Create Order
      const orderRes = await PaymentApi.createOrder(plan.planId);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      const orderData = orderRes.data;

      // 2. Check if Razorpay SDK is loaded on window
      if (window.Razorpay) {
        setStatusText('Opening Razorpay checkout gateway...');
        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Astrologer AI',
          description: `Subscription: ${plan.name}`,
          order_id: orderData.orderId,
          handler: async (response: any) => {
            setStatusText('Verifying signature on server...');
            try {
              const verifyRes = await PaymentApi.verifyPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                setIsSuccess(true);
                await refreshSubscription();
                onSuccess?.();
              } else {
                throw new Error(verifyRes.message || 'Signature verification failed.');
              }
            } catch (verErr: any) {
              setError(verErr.message || 'Payment verification failed.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {},
          theme: { color: '#C89D3C' },
        });

        rzp.open();
      } else {
        // Fallback for development/testing without live checkout script
        setStatusText('Simulating server-side authorization & capture...');
        const mockVerify = await PaymentApi.verifyPayment({
          orderId: orderData.orderId,
          paymentId: `pay_mock_${Date.now()}`,
          signature: 'sig_mock_verified',
        });

        if (mockVerify.success) {
          setIsSuccess(true);
          await refreshSubscription();
          onSuccess?.();
        } else {
          throw new Error('Simulation failed.');
        }
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid var(--border-gold)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 208, 97, 0.2)',
          background: 'linear-gradient(135deg, rgba(13, 17, 24, 0.98) 0%, rgba(20, 15, 35, 0.98) 100%)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: '#10B981',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Payment Confirmed!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Your account has been upgraded to <strong>Cosmic Premium</strong>. All advanced astrology features and expanded quotas are active.
            </p>
            <Button variant="gold" onClick={onClose} style={{ width: '100%' }}>
              Continue to Platform
            </Button>
          </div>
        ) : (
          <div>
            {/* Plan Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Sparkles size={18} color="var(--accent-gold)" />
              <Badge variant="gold">Secure Checkout</Badge>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>{plan.name}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '16px' }}>
              ${plan.displayPrice}{' '}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                / {plan.billingPeriod || 'term'}
              </span>
            </div>

            {/* Features summary */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
                Includes:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem', color: '#E2E8F0' }}>
                {plan.features.slice(0, 4).map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="var(--accent-gold)" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Status / Error feedback */}
            {statusText && loading && (
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(245, 208, 97, 0.1)', color: 'var(--accent-gold)', fontSize: '0.825rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={15} className="animate-spin" /> {statusText}
              </div>
            )}

            {error && (
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', fontSize: '0.825rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            {/* Action */}
            <Button variant="gold" onClick={handleCheckout} disabled={loading} style={{ width: '100%', padding: '12px' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : `Pay $${plan.displayPrice} with Razorpay`}
            </Button>

            <div style={{ textAlign: 'center', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '12px' }}>
              Encrypted 256-bit TLS connection. Authoritative server verification.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
