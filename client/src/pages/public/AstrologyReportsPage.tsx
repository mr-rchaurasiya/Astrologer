import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, CheckCircle2 } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { Button } from '../../components/common/Button';
import { Analytics } from '../../utils/analytics';

export const AstrologyReportsPage: React.FC = () => {
  useEffect(() => {
    Analytics.page('/astrology-reports', 'Vedic Astrology Reports & PDF Dossiers');
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Astrologer Vector PDF Horoscope Reports',
    url: 'https://astrologer.app/astrology-reports',
    description: 'Comprehensive multi-page Vedic astrology horoscope dossiers with D1/D9 charts, Vimshottari Dasha timelines, Ashtakavarga tables, and classical Vedic remedies.',
  };

  return (
    <div className="container" style={{ padding: '40px 16px', maxWidth: '1000px' }}>
      <SEOHead
        title="Comprehensive Vedic Astrology Reports & PDF Horoscope Dossiers"
        description="Generate publication-grade PDF horoscope dossiers. Includes divisional charts (D1, D9, D10), multi-decade Vimshottari dasha timelines, Ashtakavarga matrices, and personalized remedies."
        canonical="https://astrologer.app/astrology-reports"
        jsonLd={jsonLd}
      />

      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(245, 208, 97, 0.1)', border: '1px solid var(--border-gold)', color: 'var(--accent-gold)', fontSize: '0.85rem', marginBottom: '16px' }}>
          <FileText size={14} /> Publication-Quality Horoscope Dossiers
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFF', margin: '0 0 16px 0' }}>
          Comprehensive <span style={{ color: 'var(--gold-primary)' }}>Astrology Reports</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          Generate beautiful, vector-rendered PDF reports compiling your complete natal blueprint, dasha timelines, planetary strengths (Shadbala), and traditional remedies.
        </p>
      </header>

      {/* Report Features */}
      <div className="card" style={{ padding: '32px', marginBottom: '40px' }}>
        <h2 style={{ color: 'var(--accent-gold)', fontSize: '1.35rem', marginBottom: '20px' }}>
          What Is Included in Your Horoscope Dossier?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#FFF', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Full Natal Chart Suite</strong>: Crisp vector SVG charts for D1 Rashi, D9 Navamsha, and D10 Dasamsha.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#FFF', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Vimshottari Dasha Periods</strong>: Detailed Mahadasha, Antardasha, and Pratyantardasha timing tables.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#FFF', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Ashtakavarga & Shadbala</strong>: Mathematical planetary strength scores and house bindu distribution.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#FFF', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span><strong>Classical Remedial Guidance</strong>: Traditional mantras, gemstone recommendations, and lifestyle alignments.</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(13, 17, 24, 0.9)', borderRadius: '16px', border: '1px solid var(--border-gold)' }}>
        <h2 style={{ color: '#FFF', fontSize: '1.4rem', marginBottom: '12px' }}>Generate and download your dossier</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Instantly compile and save your comprehensive report in high-resolution PDF format.
        </p>
        <Link to="/register">
          <Button variant="gold" size="lg">
            <Download size={16} /> Generate Astrology Report
          </Button>
        </Link>
      </div>
    </div>
  );
};
