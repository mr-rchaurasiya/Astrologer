import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Compass, Sparkles, AlertCircle, Loader2, Shield, Calendar, Clock, MapPin } from 'lucide-react';
import { ShareApi } from '../services/shareApi';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { KundliChart } from '../components/astrology/KundliChart';
import { SouthIndianKundliChart } from '../components/astrology/SouthIndianKundliChart';
import { EastIndianKundliChart } from '../components/astrology/EastIndianKundliChart';
import { ChartStyleSelector, ChartStyle } from '../components/astrology/ChartStyleSelector';
import { ChartTabs } from '../components/astrology/ChartTabs';
import { PlanetaryTable } from '../components/astrology/PlanetaryTable';
import { PlanetName, PlanetPosition } from '../types';

export const SharedKundliPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'D1' | 'D9' | 'D10'>('D1');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('north');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPosition | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);

  useEffect(() => {
    const fetchSharedChart = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await ShareApi.getPublicSharedChart(token);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.error?.message || res.message || 'Shared chart not found or expired');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load shared chart');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedChart();
  }, [token]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', color: 'var(--accent-gold)' }} />
        <div style={{ fontSize: '1.2rem', color: '#FFF' }}>Retrieving Authoritative Vedic Kundli...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 16px' }}>
        <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
          <AlertCircle size={40} color="#EF4444" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#FFF' }}>Chart Unavailable</h2>
          <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{error}</p>
          <Link to="/" className="btn btn-gold">
            Return to Astrologer
          </Link>
        </Card>
      </div>
    );
  }

  const chart = data.chart;
  const activeDivisionalChart = chart?.divisionalCharts?.[activeTab];

  const handleSelectPlanetByName = (pName: PlanetName) => {
    const found = chart.planets.find((p: any) => p.name === pName);
    if (found) setSelectedPlanet(found);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Privacy Notice Banner */}
      <div
        style={{
          padding: '10px 16px',
          borderRadius: '8px',
          background: 'rgba(200, 157, 60, 0.08)',
          border: '1px solid rgba(200, 157, 60, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          <Shield size={16} color="var(--gold-primary)" />
          <span>Public Read-Only Kundli Horoscope View</span>
        </div>
        <Link to="/register" style={{ fontSize: '0.825rem', color: 'var(--gold-primary)', fontWeight: 600, textDecoration: 'none' }}>
          Calculate Your Own Kundli Free →
        </Link>
      </div>

      {/* Title & Native Details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#FFF' }}>{data.title}</h1>
            <Badge variant="gold">Deterministic Ephemeris</Badge>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} /> {data.dateOfBirth}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> {data.timeOfBirth}
            </span>
            {data.placeName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> {data.placeName}
              </span>
            )}
          </div>
        </div>

        <ChartStyleSelector currentStyle={chartStyle} onChangeStyle={setChartStyle} />
      </div>

      {/* Visualizer & Coordinates Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '24px' }}>
        {/* Chart SVG Card */}
        <Card glow style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-gold)" />
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{activeDivisionalChart?.title || 'Birth Chart'}</h3>
            </div>
            <ChartTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {activeDivisionalChart && chartStyle === 'north' && (
            <KundliChart
              chart={activeDivisionalChart}
              planetsInfo={chart.planets}
              selectedPlanet={selectedPlanet?.name}
              selectedHouse={selectedHouse}
              onSelectPlanet={handleSelectPlanetByName}
              onSelectHouse={setSelectedHouse}
            />
          )}

          {activeDivisionalChart && chartStyle === 'south' && (
            <SouthIndianKundliChart
              chart={activeDivisionalChart}
              planetsInfo={chart.planets}
              selectedPlanet={selectedPlanet?.name}
              selectedHouse={selectedHouse}
              onSelectPlanet={handleSelectPlanetByName}
              onSelectHouse={setSelectedHouse}
            />
          )}

          {activeDivisionalChart && chartStyle === 'east' && (
            <EastIndianKundliChart
              chart={activeDivisionalChart}
              planetsInfo={chart.planets}
              selectedPlanet={selectedPlanet?.name}
              selectedHouse={selectedHouse}
              onSelectPlanet={handleSelectPlanetByName}
              onSelectHouse={setSelectedHouse}
            />
          )}
        </Card>

        {/* Planetary Coordinates */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Compass size={18} color="var(--accent-gold)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Planetary Coordinates (Lahiri Ayanamsa)</h3>
          </div>
          <PlanetaryTable
            planets={chart.planets}
            ascendant={chart.ascendant}
            onSelectPlanet={handleSelectPlanetByName}
          />
        </Card>
      </div>
    </div>
  );
};
