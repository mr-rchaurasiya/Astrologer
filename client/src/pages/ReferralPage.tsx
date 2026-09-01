import React, { useState, useEffect } from 'react';
import { Gift, Share2, Copy, Check, Users, Award, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { ReferralApi, ReferralStats } from '../services/referralApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const ReferralPage: React.FC = () => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [claimCode, setClaimCode] = useState<string>('');
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [claimMessage, setClaimMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await ReferralApi.getMyReferralStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleCopyCode = async () => {
    if (!stats?.referralCode) return;
    try {
      await navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    if (!stats?.referralCode) return;
    const shareUrl = `${window.location.origin}/register?ref=${stats.referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Astrologer',
          text: `Unlock high-precision Vedic Kundli calculations and AI Astrologer consultations with my referral code ${stats.referralCode}:`,
          url: shareUrl,
        });
      } catch {
        // Cancelled
      }
    } else {
      handleCopyCode();
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimCode.trim()) return;

    setClaimLoading(true);
    setClaimMessage(null);
    try {
      const res = await ReferralApi.claimReferral(claimCode.trim());
      if (res.success) {
        setClaimMessage({ text: res.message || 'Referral applied successfully!', success: true });
        setClaimCode('');
        loadStats();
      } else {
        setClaimMessage({ text: res.message || 'Invalid referral code', success: false });
      }
    } catch (err: any) {
      setClaimMessage({ text: err.message || 'Failed to claim referral code', success: false });
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Gift size={24} color="var(--gold-primary)" /> Invite Friends & Earn Vedic Credits
        </h1>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Share the wisdom of Vedic astrology. Both you and your friend receive bonus AI consultation questions!
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--accent-gold)' }} />
          <div>Loading your referral statistics...</div>
        </div>
      ) : (
        <>
          {/* Top Referral Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <Card style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-gold)' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(200, 157, 60, 0.15)', color: 'var(--gold-primary)' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invited Friends</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#FFF' }}>{stats?.totalReferrals || 0}</div>
              </div>
            </Card>

            <Card style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-gold)' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Conversions</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#FFF' }}>{stats?.convertedReferrals || 0}</div>
              </div>
            </Card>

            <Card style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-gold)' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                <Sparkles size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bonus Questions Earned</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#FFF' }}>+{stats?.rewardsEarned || 0}</div>
              </div>
            </Card>
          </div>

          {/* Referral Code Box */}
          <Card glow style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '28px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#FFF' }}>Your Unique Referral Code</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Share this code with friends or family when they create an account. They get 5 bonus questions immediately upon sign up.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '12px 20px',
                  background: '#07090E',
                  borderRadius: '10px',
                  border: '1px solid var(--border-gold)',
                  fontFamily: 'monospace',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  color: 'var(--gold-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{stats?.referralCode}</span>
                <button
                  onClick={handleCopyCode}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  title="Copy code"
                >
                  {copied ? <Check size={18} color="#10B981" /> : <Copy size={18} />}
                </button>
              </div>

              <Button variant="gold" onClick={handleShare}>
                <Share2 size={16} /> Share Referral Link
              </Button>
            </div>
          </Card>

          {/* Claim Code Section for Invites */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#FFF' }}>Received an Invite Code?</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Enter a friend's referral code below to claim your initial welcome credits.
            </p>

            <form onSubmit={handleClaimSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '480px' }}>
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                placeholder="e.g. VEDIC-ABC123"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: '#07090E',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <Button variant="outline" type="submit" disabled={claimLoading || !claimCode.trim()}>
                {claimLoading ? 'Claiming...' : 'Claim Code'} <ArrowRight size={14} />
              </Button>
            </form>

            {claimMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  background: claimMessage.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: claimMessage.success ? '1px solid #10B981' : '1px solid #EF4444',
                  color: claimMessage.success ? '#10B981' : '#EF4444',
                }}
              >
                {claimMessage.text}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
