import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Shield, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { Button } from '../../components/common/Button';
import { AttributionManager } from '../../utils/attribution';
import { Analytics } from '../../utils/analytics';

export const KundliOnlinePage: React.FC = () => {
  useEffect(() => {
    AttributionManager.capture();
    Analytics.page('/kundli-online', 'Online Kundli & Vedic Birth Chart Calculator');
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Astrologer Online Kundli Calculator',
    url: 'https://astrologer.app/kundli-online',
    description: 'Calculate high-precision Vedic Kundli birth charts with Lahiri Ayanamsa, D1 Rashi, D9 Navamsha, and multi-decade Vimshottari Dashas.',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
  };

  return (
    <div className="container" style={{ padding: '40px 16px', maxWidth: '1000px' }}>
      <SEOHead
        title="Free Online Kundli & Vedic Birth Chart Calculator (Lahiri Ayanamsa)"
        description="Generate accurate Vedic Kundli birth charts instantly. Features North, South & East Indian chart styles, D1 to D60 divisional charts, and Vimshottari Dasha calculations."
        canonical="https://astrologer.app/kundli-online"
        jsonLd={jsonLd}
      />

      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(245, 208, 97, 0.1)', border: '1px solid var(--border-gold)', color: 'var(--accent-gold)', fontSize: '0.85rem', marginBottom: '16px' }}>
          <Sparkles size={14} /> High-Precision Astronomical Calculations
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FFF', margin: '0 0 16px 0', lineHeight: 1.2 }}>
          Free Online <span style={{ color: 'var(--gold-primary)' }}>Vedic Kundli</span> & Birth Chart
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
          Calculate your exact Vedic horoscope using authoritative Lahiri Ayanamsa mathematics, precise planetary longitudinal coordinates, and multi-decade Vimshottari Dashas.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/register">
            <Button variant="gold" size="lg" style={{ minWidth: '200px' }}>
              Create Your Kundli Now <ChevronRight size={18} />
            </Button>
          </Link>
          <Link to="/vedic-astrology">
            <Button variant="outline" size="lg">
              Explore Vedic Concepts
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}><Compass size={28} /></div>
          <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '8px' }}>3 Regional Chart Styles</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Switch seamlessly between North Indian (Diamond), South Indian (Fixed-Sign Grid), and East Indian (Sun-burst) visualization systems.
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}><Award size={28} /></div>
          <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '8px' }}>D1, D9 & D10 Divisional Charts</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Analyze core vitality (D1 Rashi), soul purpose and marital harmony (D9 Navamsha), and professional destiny (D10 Dasamsha).
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}><Shield size={28} /></div>
          <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '8px' }}>120-Year Vimshottari Tree</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Explore precise Mahadashas, Antardashas, and Pratyantardashas calculated directly from the Moon's exact Nakshatra degree.
          </p>
        </div>
      </section>

      {/* Explanatory Content */}
      <section className="card" style={{ padding: '32px', marginBottom: '48px' }}>
        <h2 style={{ color: 'var(--accent-gold)', fontSize: '1.5rem', marginBottom: '16px' }}>
          What Is a Vedic Kundli (Janam Kundli)?
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '16px' }}>
          A Vedic Kundli (also known as a Janam Kundli or Natal Horoscope) is a celestial map capturing the exact geometric alignment of the planets (Grahas), zodiac signs (Rashis), and astrological houses (Bhavas) at the exact time and geographical coordinates of an individual's birth.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '20px' }}>
          Unlike Western tropical astrology, classical Vedic Jyotish utilizes the Sidereal Zodiac (Nirayana system) corrected with the Chitra Paksha (Lahiri) Ayanamsa to account for the Earth's axial precession ($50.29''$ per year).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFF', fontSize: '0.9rem' }}>
            <CheckCircle2 size={16} color="#10B981" /> <strong>Ascendant (Lagna)</strong>: Rising sign determining personality and physical constitution.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFF', fontSize: '0.9rem' }}>
            <CheckCircle2 size={16} color="#10B981" /> <strong>Moon Sign (Chandra Rashi)</strong>: Emotional psychology and mind temperament.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFF', fontSize: '0.9rem' }}>
            <CheckCircle2 size={16} color="#10B981" /> <strong>Sun Sign (Surya Rashi)</strong>: Soul vitality and internal willpower.
          </div>
        </div>
      </section>

      {/* Internal Links & CTA */}
      <section style={{ textAlign: 'center', padding: '32px', background: 'rgba(245, 208, 97, 0.05)', borderRadius: '16px', border: '1px solid var(--border-gold)' }}>
        <h2 style={{ color: '#FFF', fontSize: '1.6rem', marginBottom: '12px' }}>
          Ready to discover your planetary destiny?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          Generate your complete Vedic horoscope in less than 30 seconds.
        </p>
        <Link to="/register">
          <Button variant="gold" size="lg">
            Get Your Free Kundli
          </Button>
        </Link>
      </section>
    </div>
  );
};
