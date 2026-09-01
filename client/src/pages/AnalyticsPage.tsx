import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { TrendingUp, Sparkles, Loader2, AlertCircle, User as UserIcon } from 'lucide-react';
import { ApiClient } from '../services/api';
import { BirthProfile } from '../types';
import { LifeCurveResult, TransitTimelineResult } from '../types/analytics';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LifeCurveChart } from '../components/astrology/LifeCurveChart';
import { TransitTimeline } from '../components/astrology/TransitTimeline';
import { DailyInsightCard } from '../components/astrology/DailyInsightCard';

export const AnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedProfileId = searchParams.get('profile');

  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  const [lifeCurve, setLifeCurve] = useState<LifeCurveResult | null>(null);
  const [timeline, setTimeline] = useState<TransitTimelineResult | null>(null);

  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch user's profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      setLoadingProfiles(true);
      setError(null);
      try {
        const res = await ApiClient.getProfiles();
        if (res.success && res.data && res.data.profiles.length > 0) {
          const profileList = res.data.profiles;
          setProfiles(profileList);

          let targetProfile = profileList.find((p) => p.id === requestedProfileId);
          if (!targetProfile) {
            targetProfile = profileList.find((p) => p.isPrimary) || profileList[0];
          }

          setSelectedProfileId(targetProfile.id);
          setSearchParams({ profile: targetProfile.id }, { replace: true });
        } else {
          setProfiles([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load birth profiles');
      } finally {
        setLoadingProfiles(false);
      }
    };

    loadProfiles();
  }, []);

  // 2. Fetch Life Curve & Transit Timeline whenever profile changes
  useEffect(() => {
    if (!selectedProfileId) return;

    const loadAnalytics = async () => {
      setLoadingAnalytics(true);
      setError(null);
      try {
        const [lcRes, tlRes] = await Promise.all([
          ApiClient.getLifeCurve(selectedProfileId, { resolution: 'year' }),
          ApiClient.getTransitTimeline(selectedProfileId, 365),
        ]);

        if (lcRes.success && lcRes.data) {
          setLifeCurve(lcRes.data);
        }
        if (tlRes.success && tlRes.data) {
          setTimeline(tlRes.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to calculate advanced astrology analytics.');
      } finally {
        setLoadingAnalytics(false);
      }
    };

    loadAnalytics();
  }, [selectedProfileId]);

  const handleProfileChange = (newProfileId: string) => {
    setSelectedProfileId(newProfileId);
    setSearchParams({ profile: newProfileId });
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      {/* Header & Profile Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Advanced Astrology Analytics</h1>
            <Badge variant="gold">Phase 6 Engine</Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Deterministic 80-year Life Trajectory, Astronomical Gochar Ingresses, and Transit Timelines
          </p>
        </div>

        {/* Profile Selector */}
        {profiles.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-gold)' }}>
              <UserIcon size={16} color="var(--accent-gold)" />
              <select
                className="input-field"
                style={{ background: 'transparent', border: 'none', padding: '2px 8px', color: '#FFF', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', outline: 'none' }}
                value={selectedProfileId}
                onChange={(e) => handleProfileChange(e.target.value)}
                disabled={loadingAnalytics}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id} style={{ background: '#0D1118', color: '#FFF' }}>
                    {p.name} {p.isPrimary ? '★ (Primary)' : `(${p.relationship})`} — {p.dateOfBirth}
                  </option>
                ))}
              </select>
            </div>

            <Link to={`/chat?profile=${selectedProfileId}`} className="btn btn-gold" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <Sparkles size={15} /> Ask AI
            </Link>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ padding: '14px 18px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} flex-shrink="0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loadingProfiles && profiles.length === 0 && (
        <Card glow style={{ textAlign: 'center', padding: '60px 24px', margin: '40px 0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245, 208, 97, 0.15)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'var(--accent-gold)' }}>
            <TrendingUp size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No Birth Profile Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '460px', margin: '0 auto 24px auto' }}>
            To calculate your Life Curve trajectory and transit timeline, please create your birth profile first.
          </p>
          <Link to="/profile" className="btn btn-gold">
            Create Birth Profile
          </Link>
        </Card>
      )}

      {/* Loading Skeleton */}
      {loadingAnalytics && (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', color: 'var(--accent-gold)' }} />
          <div style={{ fontSize: '1.1rem', color: '#FFF' }}>Computing 80-Year Life Curve & Transit Ingresses...</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Vimshottari Dasha Progression • Ephemeris Transits • Sade Sati Analysis
          </div>
        </div>
      )}

      {/* Main Analytics Content */}
      {!loadingAnalytics && selectedProfileId && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Daily Insight Section */}
          <DailyInsightCard profileId={selectedProfileId} profileName={selectedProfile?.name} />

          {/* Life Curve Visualizer */}
          {lifeCurve && (
            <Card glow>
              <LifeCurveChart data={lifeCurve} />
            </Card>
          )}

          {/* Transit Timeline Events */}
          {timeline && (
            <TransitTimeline events={timeline.events} profileId={selectedProfileId} />
          )}
        </div>
      )}
    </div>
  );
};
