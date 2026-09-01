import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, ShieldCheck, Zap, ChevronRight } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { Button } from '../../components/common/Button';
import { Analytics } from '../../utils/analytics';

export const AIAstrologerPage: React.FC = () => {
  useEffect(() => {
    Analytics.page('/ai-astrologer', 'AI Astrologer — Context-Grounded Vedic Consultation');
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Astrologer AI Astrologer Consultation',
    url: 'https://astrologer.app/ai-astrologer',
    description: 'Context-grounded Vedic AI Astrologer with Point & Ask interactive chart querying, Long-term AI memory, and anti-hallucination fact verification.',
    applicationCategory: 'LifestyleApplication',
  };

  return (
    <div className="container" style={{ padding: '40px 16px', maxWidth: '1000px' }}>
      <SEOHead
        title="AI Astrologer — Intelligent & Context-Grounded Vedic Consultation"
        description="Interact with a context-grounded Vedic AI Astrologer. Ask specific questions about career, relationships, dashas, transits, and yogas grounded in your exact birth chart."
        canonical="https://astrologer.app/ai-astrologer"
        jsonLd={jsonLd}
      />

      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(245, 208, 97, 0.1)', border: '1px solid var(--border-gold)', color: 'var(--accent-gold)', fontSize: '0.85rem', marginBottom: '16px' }}>
          <Bot size={14} /> Fact-Grounded Vedic Intelligence
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFF', margin: '0 0 16px 0' }}>
          Meet Your Personal <span style={{ color: 'var(--gold-primary)' }}>AI Astrologer</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          Ask deep questions about your life path, career timing, relational harmony, and dasha transitions — directly grounded in your verified planetary mathematics.
        </p>
      </header>

      {/* AI Features Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}><Zap size={26} /></div>
          <h3 style={{ color: '#FFF', fontSize: '1.15rem', marginBottom: '8px' }}>Point & Ask Precision</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Click on any specific planet, house, or dasha period in your chart to instantly launch focused AI inquiries.
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}><ShieldCheck size={26} /></div>
          <h3 style={{ color: '#FFF', fontSize: '1.15rem', marginBottom: '8px' }}>Ground-Truth Fact Guard</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Every response is cross-checked against your calculated astrological facts to eliminate hallucinations.
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}><Sparkles size={26} /></div>
          <h3 style={{ color: '#FFF', fontSize: '1.15rem', marginBottom: '8px' }}>Long-Term Context Memory</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            The AI remembers your career goals, relationship milestones, and past consultations across sessions.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(13, 17, 24, 0.9)', borderRadius: '16px', border: '1px solid var(--border-gold)' }}>
        <h2 style={{ color: '#FFF', fontSize: '1.4rem', marginBottom: '12px' }}>Start your consultation with the AI Astrologer</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Sign up to connect your birth chart and begin asking questions.
        </p>
        <Link to="/register">
          <Button variant="gold" size="lg">
            Consult AI Astrologer <ChevronRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
};
