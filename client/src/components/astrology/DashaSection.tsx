import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Orbit, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';
import { VimshottariDashaTree, DashaPeriod } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface DashaSectionProps {
  dashas: VimshottariDashaTree;
  profileId?: string;
}

export const DashaSection: React.FC<DashaSectionProps> = ({ dashas, profileId }) => {
  const navigate = useNavigate();
  const [expandedMaha, setExpandedMaha] = useState<number | null>(null);
  const [expandedAntar, setExpandedAntar] = useState<string | null>(null);

  const now = new Date();

  // Find currently active periods
  let activeMaha: DashaPeriod | undefined;
  let activeAntar: DashaPeriod | undefined;
  let activePrat: DashaPeriod | undefined;

  for (const m of dashas.mahadashas) {
    const mStart = new Date(m.startDate);
    const mEnd = new Date(m.endDate);
    if (now >= mStart && now <= mEnd) {
      activeMaha = m;
      if (m.subPeriods) {
        for (const a of m.subPeriods) {
          const aStart = new Date(a.startDate);
          const aEnd = new Date(a.endDate);
          if (now >= aStart && now <= aEnd) {
            activeAntar = a;
            if (a.subPeriods) {
              for (const p of a.subPeriods) {
                const pStart = new Date(p.startDate);
                const pEnd = new Date(p.endDate);
                if (now >= pStart && now <= pEnd) {
                  activePrat = p;
                  break;
                }
              }
            }
            break;
          }
        }
      }
      break;
    }
  }

  const handleAskAIDasha = (periodLabel: string) => {
    const query = new URLSearchParams({
      pointType: 'dasha',
      pointId: periodLabel,
      pointLabel: `Dasha Period: ${periodLabel}`,
    });
    if (profileId) {
      query.append('profile', profileId);
    }
    navigate(`/chat?${query.toString()}`);
  };

  const toggleMaha = (index: number) => {
    setExpandedMaha(expandedMaha === index ? null : index);
    setExpandedAntar(null);
  };

  const toggleAntar = (id: string) => {
    setExpandedAntar(expandedAntar === id ? null : id);
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
            <Orbit size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>120-Year Vimshottari Dasha Hierarchy</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Birth Balance: {dashas.balanceAtBirthYears.toFixed(2)} years of {dashas.startingLord}
            </span>
          </div>
        </div>
        <Badge variant="indigo">Vimshottari System</Badge>
      </div>

      {/* Currently Active Dasha Highlight Box */}
      {activeMaha && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid var(--border-gold)',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Planetary Periods (Right Now)
            </div>
            <Button
              variant="outline"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              icon={<Sparkles size={12} />}
              onClick={() =>
                handleAskAIDasha(
                  `${activeMaha?.lord} Maha / ${activeAntar?.lord || ''} Antar`
                )
              }
            >
              Ask AI about this Period
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MAHADASHA</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>{activeMaha.lord}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(activeMaha.startDate).toLocaleDateString()} — {new Date(activeMaha.endDate).toLocaleDateString()}
              </div>
            </div>
            {activeAntar && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ANTARDASHA</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{activeAntar.lord}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(activeAntar.startDate).toLocaleDateString()} — {new Date(activeAntar.endDate).toLocaleDateString()}
                </div>
              </div>
            )}
            {activePrat && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PRATYANTARDASHA</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60A5FA' }}>{activePrat.lord}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(activePrat.startDate).toLocaleDateString()} — {new Date(activePrat.endDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Mahadasha Timeline Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
          LIFETIME MAHADASHA TIMELINE
        </div>
        <div style={{ display: 'flex', width: '100%', height: '36px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          {dashas.mahadashas.map((m) => {
            const isCurrent = activeMaha?.lord === m.lord;
            const pct = (m.durationYears / 120.0) * 100;
            return (
              <div
                key={m.lord}
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: isCurrent ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                  color: isCurrent ? '#000' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: isCurrent ? 700 : 500,
                  borderRight: '1px solid rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  padding: '0 2px',
                }}
                title={`${m.lord} Mahadasha (${m.durationYears.toFixed(1)} yrs: ${new Date(m.startDate).toLocaleDateString()} - ${new Date(m.endDate).toLocaleDateString()})`}
              >
                {m.lord.substring(0, 3)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable 3-tier Dasha Tree */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '600px' }}>
          {dashas.mahadashas.map((maha, mIdx) => {
            const isMahaExpanded = expandedMaha === mIdx;
            const isCurrentMaha = activeMaha?.lord === maha.lord;

            return (
              <div key={maha.lord} style={{ marginBottom: '8px', borderRadius: '8px', border: isCurrentMaha ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
                {/* Mahadasha Row */}
                <div
                  onClick={() => toggleMaha(mIdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    background: isCurrentMaha ? 'rgba(245, 208, 97, 0.06)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isMahaExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span style={{ fontWeight: 600, color: isCurrentMaha ? 'var(--accent-gold)' : '#FFF' }}>
                      {maha.lord} Mahadasha ({maha.durationYears.toFixed(2)} yrs)
                    </span>
                    {isCurrentMaha && <Badge variant="gold">Active</Badge>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(maha.startDate).toLocaleDateString()} — {new Date(maha.endDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Expanded Antardashas */}
                {isMahaExpanded && maha.subPeriods && (
                  <div style={{ padding: '8px 14px 14px 32px', borderTop: '1px solid var(--border-subtle)' }}>
                    {maha.subPeriods.map((antar) => {
                      const antarId = `${maha.lord}-${antar.lord}`;
                      const isAntarExpanded = expandedAntar === antarId;
                      const isCurrentAntar = activeAntar?.lord === antar.lord && isCurrentMaha;

                      return (
                        <div key={antarId} style={{ marginBottom: '6px' }}>
                          <div
                            onClick={() => toggleAntar(antarId)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: isCurrentAntar ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                              fontSize: '0.825rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isAntarExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              <span>{antar.lord} Antardasha</span>
                              {isCurrentAntar && <Badge variant="indigo">Active</Badge>}
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                              {new Date(antar.startDate).toLocaleDateString()} — {new Date(antar.endDate).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Expanded Pratyantardashas */}
                          {isAntarExpanded && antar.subPeriods && (
                            <div style={{ paddingLeft: '28px', marginTop: '6px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '6px' }}>
                              {antar.subPeriods.map((prat, pIdx) => {
                                const isCurrentPrat = isCurrentAntar && activePrat?.lord === prat.lord;
                                return (
                                  <div
                                    key={pIdx}
                                    style={{
                                      padding: '6px 8px',
                                      borderRadius: '4px',
                                      background: isCurrentPrat ? 'rgba(96, 165, 250, 0.15)' : 'rgba(255, 255, 255, 0.01)',
                                      border: isCurrentPrat ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid var(--border-subtle)',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    <div style={{ fontWeight: 600, color: isCurrentPrat ? '#60A5FA' : '#FFF' }}>
                                      {prat.lord} Pratyantar
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                      {new Date(prat.startDate).toLocaleDateString()} - {new Date(prat.endDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
