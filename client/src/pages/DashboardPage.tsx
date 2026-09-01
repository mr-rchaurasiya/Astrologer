import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Orbit, Moon, TrendingUp, MessageSquare, Plus, Star, MapPin, Calendar, Clock, ArrowRight, Loader2, Zap } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { ApiClient } from '../services/api';
import { BirthProfile, AstrologyChartOutput } from '../types';
import { DailyInsightCard } from '../components/astrology/DailyInsightCard';
import { recommendationApi } from '../services/recommendationApi';
import { RecommendationItem } from '../types/recommendation';
import { RecommendationList } from '../components/recommendations/RecommendationList';
import { SEOHead } from '../components/seo/SEOHead';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [primaryProfile, setPrimaryProfile] = useState<BirthProfile | null>(null);
  const [chart, setChart] = useState<AstrologyChartOutput | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const profileRes = await ApiClient.getProfiles();
        if (profileRes.success && profileRes.data && profileRes.data.profiles.length > 0) {
          const primary = profileRes.data.profiles.find((p) => p.isPrimary) || profileRes.data.profiles[0];
          setPrimaryProfile(primary);

          // Fetch authoritative calculated chart for this primary profile
          try {
            const chartRes = await ApiClient.getAstrologyChart(primary.id);
            if (chartRes.success && chartRes.data) {
              setChart(chartRes.data.chart);
            }
          } catch {
            // Silently fallback if chart computation fails
          }

          // Fetch smart recommendations
          try {
            const recs = await recommendationApi.getRecommendations();
            setRecommendations(recs);
          } catch {
            // Silently ignore
          }
        }
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleDismissRecommendation = (id: string) => {
    recommendationApi.dismissRecommendation(id);
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  };

  const moon = chart?.planets.find((p) => p.name === 'Moon');

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      <SEOHead title="Personal Dashboard" noindex={true} />
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>
              Welcome back, <span className="text-gradient-gold">{user?.name}</span>
            </h1>
            <Badge variant="gold">Phase 6 Engine Active</Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Advanced Vedic Astrology Analytics, Life Trajectory Curve & AI Consultations
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/analytics" className="btn btn-gold" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <TrendingUp size={16} /> Open Analytics
          </Link>
          <Link to="/subscription" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Zap size={16} /> Subscription
          </Link>
          {primaryProfile && (
            <Link to={`/chat?profile=${primaryProfile.id}`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <MessageSquare size={16} /> Ask AI
            </Link>
          )}
        </div>
      </div>

      {/* Primary Profile Cosmic Summary Card */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 10px auto', color: 'var(--accent-gold)' }} />
          <div>Loading your cosmic dashboard...</div>
        </div>
      ) : primaryProfile ? (
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            marginBottom: '32px',
            border: '1px solid var(--border-gold)',
            boxShadow: 'var(--shadow-gold)',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(13, 17, 24, 0.95) 0%, rgba(7, 9, 14, 0.98) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-gold)' }}>
                <Star size={22} fill="var(--accent-gold)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{primaryProfile.name}</h3>
                  <Badge variant="gold">Primary Profile</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {primaryProfile.dateOfBirth}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {primaryProfile.timeOfBirth}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} /> {primaryProfile.placeName}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to={`/analytics?profile=${primaryProfile.id}`} className="btn btn-gold" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                <TrendingUp size={15} /> View Life Curve
              </Link>
              <Link to={`/kundli?profile=${primaryProfile.id}`} className="btn btn-outline" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                Open Full Kundli <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Astrological Coordinates Summary */}
          {chart && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div className="glass-panel" style={{ padding: '10px 14px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ascendant (Lagna)</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60A5FA', marginTop: '2px' }}>
                  {chart.ascendant.sign} ({chart.ascendant.signDegree.toFixed(2)}°)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Lord: {chart.houses[0].lord}</div>
              </div>

              <div className="glass-panel" style={{ padding: '10px 14px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Moon Sign (Rashi)</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '2px' }}>
                  {moon ? `${moon.sign} (${moon.signDegree.toFixed(2)}°)` : '—'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>House {moon?.house}</div>
              </div>

              <div className="glass-panel" style={{ padding: '10px 14px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Birth Nakshatra</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', marginTop: '2px' }}>
                  {moon ? `${moon.nakshatra} (Pada ${moon.pada})` : '—'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Lord: {moon?.nakshatraLord}</div>
              </div>

              <div className="glass-panel" style={{ padding: '10px 14px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lahiri Ayanamsa</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34D399', marginTop: '2px' }}>
                  {chart.ayanamsa.formatted}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Standard Chitra Paksha</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card glow style={{ textAlign: 'center', padding: '40px 24px', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 208, 97, 0.15)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', color: 'var(--accent-gold)' }}>
            <Plus size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>No Birth Profile Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 18px auto' }}>
            Add your exact birth coordinates to unlock your personalized Vedic birth chart and AI readings.
          </p>
          <Link to="/profile" className="btn btn-gold">
            <Plus size={15} /> Create Birth Profile
          </Link>
        </Card>
      )}

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <RecommendationList
            recommendations={recommendations}
            onDismiss={handleDismissRecommendation}
          />
        </div>
      )}

      {/* Live Daily Insight Widget */}
      {primaryProfile && (
        <div style={{ marginBottom: '32px' }}>
          <DailyInsightCard profileId={primaryProfile.id} profileName={primaryProfile.name} />
        </div>
      )}

      {/* Feature Modules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* 1. Life Trajectory Curve */}
        <Card glow>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#22D3EE' }}>
                <TrendingUp size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Life Trajectory Curve</h3>
            </div>
            <Badge variant="emerald">Live</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
            Multi-decade deterministic astrological strength curve mapped to major Vimshottari Dasha transitions and Gochar transits.
          </p>
          <Link to={primaryProfile ? `/analytics?profile=${primaryProfile.id}` : '/analytics'} className="btn btn-gold" style={{ width: '100%', fontSize: '0.85rem' }}>
            Open Life Curve Visualizer
          </Link>
        </Card>

        {/* 2. Planetary Transit Ingresses & Timeline */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 208, 97, 0.15)', color: 'var(--accent-gold)' }}>
                <Compass size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Transit Events & Ingresses</h3>
            </div>
            <Badge variant="emerald">Live</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
            Chronological transit timeline detecting Jupiter/Saturn sign changes, retrograde stations, and Sade Sati milestones.
          </p>
          <Link to={primaryProfile ? `/analytics?profile=${primaryProfile.id}` : '/analytics'} className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>
            View Transit Timeline
          </Link>
        </Card>

        {/* 3. AI Astrologer Consultation */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#FB7185' }}>
                <MessageSquare size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>AI Astrologer Consultation</h3>
            </div>
            <Badge variant="emerald">Live</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
            Natural language inquiry grounded in structured chart facts with interactive Point & Ask chart insights and session history.
          </p>
          <Link to={primaryProfile ? `/chat?profile=${primaryProfile.id}` : '/chat'} className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>
            Open AI Astrologer Chat
          </Link>
        </Card>

        {/* 4. Kundli Visualization */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 208, 97, 0.15)', color: 'var(--accent-gold)' }}>
                <Compass size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Vedic Kundli Charts</h3>
            </div>
            <Badge variant="emerald">Live</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
            Interactive North Indian SVG visualizer for D1 Rashi, D9 Navamsha, and D10 Dashamsha with exact degrees and house placements.
          </p>
          <Link to="/kundli" className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>
            Open Kundli Visualizer
          </Link>
        </Card>

        {/* 5. Dasha System */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                <Orbit size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>120-Yr Vimshottari Dasha</h3>
            </div>
            <Badge variant="emerald">Live</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
            Hierarchical Mahadasha, Antardasha, and Pratyantardasha timeline based on your birth Moon Nakshatra balance.
          </p>
          <Link to="/kundli" className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>
            View Dasha Progression
          </Link>
        </Card>

        {/* 6. Panchang & Muhurta */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                <Moon size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Daily Panchang & Muhurta</h3>
            </div>
            <Badge variant="emerald">Live</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
            5 sacred limbs (Tithi, Vara, Nakshatra, Yoga, Karana) + Rahu Kaal, Gulika, and Abhijit Muhurta windows.
          </p>
          <Link to="/kundli" className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>
            View Today's Panchang
          </Link>
        </Card>
      </div>
    </div>
  );
};
