import React from 'react';
import { Shield, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ color: 'var(--gold-primary)' }}>
                <Sparkles size={20} />
              </div>
              <span className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>
                JYOTISH<span style={{ color: 'var(--gold-primary)' }}> AI</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
              Advanced Vedic Astrology intelligence combining deterministic Lahiri ephemeris calculations with context-grounded AI analysis.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#FFF', fontSize: '0.95rem', marginBottom: '16px' }}>Calculation Pillars</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li>✦ Sidereal Zodiac & Lahiri Ayanamsa</li>
              <li>✦ D1 Rashi, D9 Navamsha, D10 Dashamsha</li>
              <li>✦ 120-Year Vimshottari Dasha Tree</li>
              <li>✦ High-Precision 5-Attribute Panchang</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFF', fontSize: '0.95rem', marginBottom: '16px' }}>Security & Principles</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} color="var(--emerald-accent)" /> 100% Deterministic Planetary Math
              </li>
              <li>✦ Zero LLM Hallucinated Coordinates</li>
              <li>✦ Multi-Tenant Encrypted Isolation</li>
              <li>✦ Non-Fatalistic Karmic Interpretations</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Jyotish AI Platform. All rights reserved. Not intended as legal, financial, or medical counsel.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>Built with precision</span>
            <Heart size={14} color="#F43F5E" fill="#F43F5E" />
            <span>for authentic Vedic Astrology</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
