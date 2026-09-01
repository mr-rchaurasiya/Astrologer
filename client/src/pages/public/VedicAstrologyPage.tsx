import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Star, ChevronRight } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { Button } from '../../components/common/Button';
import { Analytics } from '../../utils/analytics';

export const VedicAstrologyPage: React.FC = () => {
  useEffect(() => {
    Analytics.page('/vedic-astrology', 'Vedic Astrology Fundamentals & Principles');
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Fundamentals of Vedic Astrology (Jyotish Shastra)',
    description: 'A comprehensive guide to classical Vedic astrology, Nirayana zodiac calculations, 12 Rashis, 9 Grahas, 27 Nakshatras, and Lahiri Ayanamsa.',
    author: {
      '@type': 'Organization',
      name: 'Astrologer',
    },
  };

  return (
    <div className="container" style={{ padding: '40px 16px', maxWidth: '1000px' }}>
      <SEOHead
        title="Vedic Astrology (Jyotish) Fundamentals, Principles & Planetary Rules"
        description="Learn the authentic mathematical principles of Vedic Astrology: 9 Grahas, 12 Bhavas, 27 Nakshatras, and the Sidereal Lahiri Ayanamsa system."
        canonical="https://astrologer.app/vedic-astrology"
        jsonLd={jsonLd}
      />

      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(245, 208, 97, 0.1)', border: '1px solid var(--border-gold)', color: 'var(--accent-gold)', fontSize: '0.85rem', marginBottom: '16px' }}>
          <BookOpen size={14} /> Jyotish Vidya & Classical Astronomical Wisdom
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFF', margin: '0 0 16px 0' }}>
          The Foundation of <span style={{ color: 'var(--gold-primary)' }}>Vedic Astrology</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          Explore the profound astronomical and spiritual mechanics of Jyotish Shastra — the "Eye of the Vedas."
        </p>
      </header>

      {/* Core Principles Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Star size={18} /> The 9 Grahas (Planets)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Surya (Sun), Chandra (Moon), Mangala (Mars), Budha (Mercury), Guru (Jupiter), Shukra (Venus), Shani (Saturn), and the lunar nodes Rahu and Ketu govern karmic expression.
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={18} /> 27 Lunar Mansions (Nakshatras)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Spanning $13^\circ20'$ each, the 27 Nakshatras provide deep psychological and timing precision, dividing further into 4 Padas of $3^\circ20'$ each.
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <BookOpen size={18} /> 12 Bhavas (Houses)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            From Tanu Bhava (1st house - self) to Moksha Bhava (12th house - liberation), the 12 Bhavas map all human experiences and life domains.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(13, 17, 24, 0.9)', borderRadius: '16px', border: '1px solid var(--border-gold)' }}>
        <h2 style={{ color: '#FFF', fontSize: '1.4rem', marginBottom: '12px' }}>Calculate your personal Vedic birth chart</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Apply these principles to your own planetary placements with our high-precision calculator.
        </p>
        <Link to="/kundli-online">
          <Button variant="gold" size="lg">
            Calculate My Kundli <ChevronRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
};
