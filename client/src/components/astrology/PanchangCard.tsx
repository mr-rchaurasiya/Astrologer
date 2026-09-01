import React, { useState } from 'react';
import { Sun, Moon, Sunset, Sunrise, Calendar, Loader2 } from 'lucide-react';
import { PanchangInfo } from '../../types';
import { Card } from '../common/Card';
import { ApiClient } from '../../services/api';

interface PanchangCardProps {
  initialPanchang: PanchangInfo;
  latitude?: number;
  longitude?: number;
}

export const PanchangCard: React.FC<PanchangCardProps> = ({ initialPanchang, latitude = 23.1765, longitude = 75.7885 }) => {
  const [panchang, setPanchang] = useState<PanchangInfo>(initialPanchang);
  const [selectedDate, setSelectedDate] = useState<string>(initialPanchang.date);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    setLoading(true);
    try {
      const res = await ApiClient.getPanchang({
        date: newDate,
        latitude,
        longitude,
      });
      if (res.success && res.data) {
        setPanchang(res.data.panchang);
      }
    } catch {
      // Keep previous panchang on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
            <Sun size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Daily Vedic Panchang</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>The 5 Sacred Limbs of Time</span>
          </div>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={15} color="var(--accent-gold)" />
          <input
            type="date"
            className="input-field"
            style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
          {loading && <Loader2 size={16} className="animate-spin" color="var(--accent-gold)" />}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {/* 1. Tithi */}
        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1. TITHI (LUNAR DAY)</span>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px', color: '#FFF' }}>
            {panchang.tithi.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {panchang.tithi.paksha} Paksha ({panchang.tithi.percentage.toFixed(1)}% elapsed)
          </div>
        </div>

        {/* 2. Vara */}
        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2. VARA (SOLAR DAY)</span>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px', color: '#FFF' }}>
            {panchang.vara.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Ruler: {panchang.vara.rulingPlanet}
          </div>
        </div>

        {/* 3. Nakshatra */}
        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3. NAKSHATRA (MOON MANSION)</span>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px', color: '#FFF' }}>
            {panchang.nakshatra.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Lord: {panchang.nakshatra.lord}
          </div>
        </div>

        {/* 4. Yoga */}
        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>4. YOGA (SOLI-LUNAR SUM)</span>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px', color: '#FFF' }}>
            {panchang.yoga.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Yoga #{panchang.yoga.number} of 27
          </div>
        </div>

        {/* 5. Karana */}
        <div className="glass-panel" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>5. KARANA (HALF-TITHI)</span>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px', color: '#FFF' }}>
            {panchang.karana.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Type: {panchang.karana.type}
          </div>
        </div>
      </div>

      {/* Sun Times Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sunrise size={16} color="#F5D061" />
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SUNRISE</span>
            <div>{new Date(panchang.sunTimes.sunrise).toLocaleTimeString()}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sun size={16} color="#F5D061" />
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SOLAR NOON</span>
            <div>{new Date(panchang.sunTimes.solarNoon).toLocaleTimeString()}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sunset size={16} color="#F5D061" />
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SUNSET</span>
            <div>{new Date(panchang.sunTimes.sunset).toLocaleTimeString()}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Moon size={16} color="#818CF8" />
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>DAY DURATION</span>
            <div>{Math.floor(panchang.sunTimes.dayDurationMinutes / 60)}h {panchang.sunTimes.dayDurationMinutes % 60}m</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
