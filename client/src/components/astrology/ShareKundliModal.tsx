import React, { useState } from 'react';
import { Share2, Copy, Check, X, Shield, Clock } from 'lucide-react';
import { Button } from '../common/Button';
import { ShareApi } from '../../services/shareApi';

interface ShareKundliModalProps {
  profileId: string;
  profileName: string;
  onClose: () => void;
}

export const ShareKundliModal: React.FC<ShareKundliModalProps> = ({ profileId, profileName, onClose }) => {
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ShareApi.createShareLink({
        profileId,
        expiresInDays,
        title: `${profileName}'s Vedic Horoscope`,
      });

      if (res.success && res.data?.token) {
        const fullUrl = `${window.location.origin}/shared/kundli/${res.data.token}`;
        setShareUrl(fullUrl);
      } else {
        setError('Failed to generate share link');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileName}'s Vedic Horoscope`,
          text: `View ${profileName}'s authoritative Vedic Kundli birth chart and planetary coordinates:`,
          url: shareUrl,
        });
      } catch {
        // Share cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 9, 14, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'linear-gradient(145deg, #0D1118 0%, #151C28 100%)',
          borderRadius: '16px',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-gold)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={20} color="var(--gold-primary)" /> Share Kundli Horoscope
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(200, 157, 60, 0.08)', border: '1px solid rgba(200, 157, 60, 0.2)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Shield size={20} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Shared links expose only planetary positions, houses, and chart graphics. Your account, billing, and private AI chats remain completely private.
          </p>
        </div>

        {!shareUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Link Validity / Expiration
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10))}
                className="input-field"
                style={{ width: '100%', padding: '10px', background: '#07090E', color: '#FFF', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
              >
                <option value={1}>1 Day (Quick Share)</option>
                <option value={7}>7 Days (Standard)</option>
                <option value={30}>30 Days (Extended)</option>
                <option value={90}>90 Days (Quarterly)</option>
              </select>
            </div>

            {error && <div style={{ color: '#EF4444', fontSize: '0.85rem' }}>{error}</div>}

            <Button variant="gold" onClick={handleGenerateLink} disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Generating Secure Link...' : 'Create Expiring Share Link'}
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Your secure, expiring link is ready to share:
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: '#07090E',
                  color: '#FFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  outline: 'none',
                }}
              />
              <Button variant="gold" size="sm" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <Button variant="outline" size="sm" onClick={handleNativeShare} style={{ flex: 1 }}>
                  <Share2 size={16} /> Share via App
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose} style={{ flex: 1 }}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
