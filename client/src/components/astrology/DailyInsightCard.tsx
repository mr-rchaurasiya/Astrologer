import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DailyInsightResponse, DailyInsightCategory } from '../../types/analytics';
import { ApiClient } from '../../services/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Sparkles, RefreshCw, MessageSquare, Loader2, Orbit } from 'lucide-react';

interface DailyInsightCardProps {
  profileId: string;
  profileName?: string;
}

const CATEGORIES: { key: DailyInsightCategory; label: string }[] = [
  { key: 'overall', label: 'Overall' },
  { key: 'career', label: 'Career & Karma' },
  { key: 'finance', label: 'Finance' },
  { key: 'relationships', label: 'Relationships' },
  { key: 'learning', label: 'Learning' },
  { key: 'spirituality', label: 'Spirituality' },
];

export const DailyInsightCard: React.FC<DailyInsightCardProps> = ({ profileId }) => {
  const [selectedCategory, setSelectedCategory] = useState<DailyInsightCategory>('overall');
  const [insight, setInsight] = useState<DailyInsightResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = async (category: DailyInsightCategory) => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.getDailyInsight({
        profileId,
        category,
      });
      if (res.success && res.data) {
        setInsight(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch daily astrological insight');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight(selectedCategory);
  }, [profileId, selectedCategory]);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card glow style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
              border: '1px solid var(--border-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Personalized Daily Horoscope</h3>
              <Badge variant="gold">{todayStr}</Badge>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Synthesized from active Vimshottari Dasha and real-time planetary Gochar
            </p>
          </div>
        </div>

        {/* Refresh & Follow-up */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => fetchInsight(selectedCategory)}
            disabled={loading}
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            title="Refresh Daily Insight"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            to={`/chat?profile=${profileId}&pointType=planet&pointId=Moon&pointLabel=Daily Insight Discussion`}
            className="btn btn-gold"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            <MessageSquare size={14} /> Ask Follow-up
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: isSelected ? 'rgba(245, 208, 97, 0.15)' : 'transparent',
                color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                borderBottom: isSelected ? '2px solid var(--accent-gold)' : '2px solid transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 10px auto', color: 'var(--accent-gold)' }} />
          <div>Synthesizing daily celestial alignments & planetary influences...</div>
        </div>
      ) : error ? (
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', fontSize: '0.875rem' }}>
          {error}
        </div>
      ) : insight ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Metadata badges if available */}
          {insight.metadata && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {insight.metadata.mahadasha && (
                <span className="glass-panel" style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Orbit size={12} color="#60A5FA" /> {insight.metadata.mahadasha} Mahadasha
                </span>
              )}
              {insight.metadata.transitMoonSign && (
                <span className="glass-panel" style={{ padding: '4px 10px' }}>
                  Moon in {insight.metadata.transitMoonSign}
                </span>
              )}
              {insight.cached && (
                <Badge variant="emerald">Cached for Today</Badge>
              )}
            </div>
          )}

          {/* Reading Content */}
          <div
            style={{
              lineHeight: 1.6,
              fontSize: '0.925rem',
              color: '#E2E8F0',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'pre-line',
            }}
          >
            {insight.content}
          </div>
        </div>
      ) : null}
    </Card>
  );
};
