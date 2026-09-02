import React from 'react';

export const CosmicBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* 1. Deep Space Ambient Nebula Gradients */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '-8%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 208, 97, 0.08) 0%, rgba(212, 175, 55, 0.03) 50%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* 2. Top-Right Celestial Astrolabe & Orbital Rings */}
      <svg
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '560px',
          height: '560px',
          opacity: 0.18,
        }}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="250" cy="250" r="230" stroke="#F5D061" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="250" cy="250" r="190" stroke="#818CF8" strokeWidth="0.8" />
        <circle cx="250" cy="250" r="140" stroke="#F5D061" strokeWidth="1.2" />
        <circle cx="250" cy="250" r="90" stroke="#C084FC" strokeWidth="0.8" strokeDasharray="2 6" />
        <circle cx="250" cy="250" r="40" stroke="#F5D061" strokeWidth="1" />
        
        {/* Zodiac Coordinate Degree Crosshairs */}
        <line x1="250" y1="10" x2="250" y2="490" stroke="#F5D061" strokeWidth="0.6" strokeDasharray="6 6" />
        <line x1="10" y1="250" x2="490" y2="250" stroke="#F5D061" strokeWidth="0.6" strokeDasharray="6 6" />
        <line x1="80" y1="80" x2="420" y2="420" stroke="#818CF8" strokeWidth="0.5" />
        <line x1="80" y1="420" x2="420" y2="80" stroke="#818CF8" strokeWidth="0.5" />

        {/* Ecliptic Node Points */}
        <circle cx="250" cy="20" r="3" fill="#F5D061" />
        <circle cx="440" cy="250" r="3" fill="#F5D061" />
        <circle cx="250" cy="440" r="3" fill="#818CF8" />
        <circle cx="60" cy="250" r="3" fill="#818CF8" />
      </svg>

      {/* 3. Bottom-Left Sacred Planetary Geometry / Astrolabe */}
      <svg
        style={{
          position: 'absolute',
          bottom: '-120px',
          left: '-120px',
          width: '520px',
          height: '520px',
          opacity: 0.15,
        }}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="250" cy="250" r="220" stroke="#818CF8" strokeWidth="0.8" />
        <polygon points="250,30 440,360 60,360" stroke="#F5D061" strokeWidth="0.8" strokeDasharray="3 3" />
        <polygon points="250,470 440,140 60,140" stroke="#F5D061" strokeWidth="0.8" strokeDasharray="3 3" />
        <circle cx="250" cy="250" r="160" stroke="#C084FC" strokeWidth="0.6" />
        <circle cx="250" cy="250" r="100" stroke="#F5D061" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="250" cy="250" r="4" fill="#F5D061" />
      </svg>

      {/* 4. Constellation Star Maps (Saptarishi & Orion Nakshatras) */}
      <svg
        style={{
          position: 'absolute',
          top: '22%',
          left: '8%',
          width: '260px',
          height: '180px',
          opacity: 0.22,
        }}
        viewBox="0 0 260 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Saptarishi / Ursa Major Lines */}
        <polyline
          points="20,40 60,50 110,35 150,70 190,80 230,130 180,145 150,70"
          stroke="#F5D061"
          strokeWidth="0.8"
          strokeDasharray="2 3"
        />
        {/* Stars */}
        <circle cx="20" cy="40" r="2.5" fill="#FFF" />
        <circle cx="60" cy="50" r="2" fill="#F5D061" />
        <circle cx="110" cy="35" r="2.5" fill="#FFF" />
        <circle cx="150" cy="70" r="3" fill="#F5D061" />
        <circle cx="190" cy="80" r="2" fill="#818CF8" />
        <circle cx="230" cy="130" r="2.5" fill="#FFF" />
        <circle cx="180" cy="145" r="2.5" fill="#F5D061" />
      </svg>

      {/* Orion / Mrigashira Constellation */}
      <svg
        style={{
          position: 'absolute',
          top: '45%',
          right: '10%',
          width: '220px',
          height: '240px',
          opacity: 0.2,
        }}
        viewBox="0 0 220 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shoulders & Feet */}
        <line x1="40" y1="40" x2="180" y2="50" stroke="#818CF8" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="40" y1="40" x2="90" y2="120" stroke="#F5D061" strokeWidth="0.6" />
        <line x1="180" y1="50" x2="130" y2="120" stroke="#F5D061" strokeWidth="0.6" />
        {/* Orion Belt Stars */}
        <line x1="90" y1="120" x2="110" y2="122" stroke="#FFF" strokeWidth="1" />
        <line x1="110" y1="122" x2="130" y2="124" stroke="#FFF" strokeWidth="1" />
        {/* Lower body */}
        <line x1="90" y1="120" x2="50" y2="200" stroke="#818CF8" strokeWidth="0.6" />
        <line x1="130" y1="124" x2="170" y2="195" stroke="#F5D061" strokeWidth="0.6" />
        <line x1="50" y1="200" x2="170" y2="195" stroke="#818CF8" strokeWidth="0.8" strokeDasharray="3 3" />

        {/* Betelgeuse (Red/Gold Star) */}
        <circle cx="40" cy="40" r="3.5" fill="#F59E0B" />
        {/* Bellatrix */}
        <circle cx="180" cy="50" r="2.5" fill="#818CF8" />
        {/* Belt */}
        <circle cx="90" cy="120" r="2.2" fill="#FFF" />
        <circle cx="110" cy="122" r="2.5" fill="#FFF" />
        <circle cx="130" cy="124" r="2.2" fill="#FFF" />
        {/* Saiph & Rigel */}
        <circle cx="50" cy="200" r="2.5" fill="#818CF8" />
        <circle cx="170" cy="195" r="3.5" fill="#67E8F9" />
      </svg>

      {/* 5. Animated Twinkling CSS Stars Field */}
      <div className="cosmic-stars-container">
        <div className="star star-1" style={{ top: '15%', left: '25%' }} />
        <div className="star star-2" style={{ top: '28%', left: '72%' }} />
        <div className="star star-3" style={{ top: '65%', left: '18%' }} />
        <div className="star star-1" style={{ top: '78%', left: '82%' }} />
        <div className="star star-2" style={{ top: '40%', left: '48%' }} />
        <div className="star star-3" style={{ top: '88%', left: '35%' }} />
        <div className="star star-1" style={{ top: '8%', left: '60%' }} />
        <div className="star star-2" style={{ top: '55%', left: '88%' }} />
        <div className="star star-3" style={{ top: '92%', left: '65%' }} />
        <div className="star star-1" style={{ top: '35%', left: '12%' }} />
      </div>
    </div>
  );
};
