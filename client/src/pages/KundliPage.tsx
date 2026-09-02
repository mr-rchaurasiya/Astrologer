import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Compass, Sparkles, AlertCircle, Loader2, Plus, RefreshCw, User as UserIcon, MessageSquare, FileText, Share2 } from 'lucide-react';
import { ApiClient } from '../services/api';
import { BirthProfile, AstrologyChartOutput, PlanetName, PlanetPosition } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

import { KundliChart } from '../components/astrology/KundliChart';
import { SouthIndianKundliChart } from '../components/astrology/SouthIndianKundliChart';
import { EastIndianKundliChart } from '../components/astrology/EastIndianKundliChart';
import { ChartStyleSelector, ChartStyle } from '../components/astrology/ChartStyleSelector';
import { ShareKundliModal } from '../components/astrology/ShareKundliModal';
import { ChartTabs } from '../components/astrology/ChartTabs';
import { PlanetaryTable } from '../components/astrology/PlanetaryTable';
import { PlanetDetailModal } from '../components/astrology/PlanetDetailModal';
import { HouseTable } from '../components/astrology/HouseTable';
import { LagnaCard } from '../components/astrology/LagnaCard';
import { BirthDetailsCard } from '../components/astrology/BirthDetailsCard';
import { NakshatraCard } from '../components/astrology/NakshatraCard';
import { VedicAspectsCard } from '../components/astrology/VedicAspectsCard';
import { DashaSection } from '../components/astrology/DashaSection';
import { PanchangCard } from '../components/astrology/PanchangCard';
import { MuhurtaCard } from '../components/astrology/MuhurtaCard';
import { TransitCard } from '../components/astrology/TransitCard';

export const KundliPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedProfileId = searchParams.get('profile');

  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [chart, setChart] = useState<AstrologyChartOutput | null>(null);
  const [activeTab, setActiveTab] = useState<'D1' | 'D9' | 'D10'>('D1');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('north');
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPosition | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
  const [loadingChart, setLoadingChart] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch user's profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      setLoadingProfiles(true);
      setError(null);
      try {
        const res = await ApiClient.getProfiles();
        if (res.success && res.data && res.data.profiles.length > 0) {
          const profileList = res.data.profiles;
          setProfiles(profileList);

          let targetProfile = profileList.find((p) => p.id === requestedProfileId);
          if (!targetProfile) {
            targetProfile = profileList.find((p) => p.isPrimary) || profileList[0];
          }

          setSelectedProfileId(targetProfile.id);
          setSearchParams({ profile: targetProfile.id }, { replace: true });
        } else {
          setProfiles([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load birth profiles');
      } finally {
        setLoadingProfiles(false);
      }
    };

    loadProfiles();
  }, []);

  // 2. Fetch authoritative chart calculation whenever selectedProfileId changes
  useEffect(() => {
    if (!selectedProfileId) return;

    const loadChart = async () => {
      setLoadingChart(true);
      setError(null);
      try {
        const res = await ApiClient.getAstrologyChart(selectedProfileId);
        if (res.success && res.data && res.data.chart) {
          setChart(res.data.chart);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to calculate Vedic astrology chart for selected profile.');
      } finally {
        setLoadingChart(false);
      }
    };

    loadChart();
  }, [selectedProfileId]);

  const handleProfileChange = (newProfileId: string) => {
    setSelectedProfileId(newProfileId);
    setSearchParams({ profile: newProfileId });
  };

  const handleSelectPlanetByName = (name: PlanetName) => {
    if (!chart) return;
    const found = chart.planets.find((p) => p.name === name) || null;
    setSelectedPlanet(found);
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const moon = chart?.planets.find((p) => p.name === 'Moon');

  const activeDivisionalChart = chart
    ? activeTab === 'D1'
      ? chart.divisionalCharts.d1
      : activeTab === 'D9'
      ? chart.divisionalCharts.d9
      : chart.divisionalCharts.d10
    : null;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      {/* Header & Profile Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Vedic Birth Chart (Kundli)</h1>
            <Badge variant="gold">Deterministic Calculation Engine</Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            High-precision astronomical ephemeris, Lahiri Ayanamsa, and divisional charts
          </p>
        </div>

        {/* Profile Selector & AI Quick Link */}
        {profiles.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-gold)' }}>
              <UserIcon size={16} color="var(--accent-gold)" />
              <select
                className="input-field"
                style={{ background: 'transparent', border: 'none', padding: '2px 8px', color: '#FFF', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', outline: 'none' }}
                value={selectedProfileId}
                onChange={(e) => handleProfileChange(e.target.value)}
                disabled={loadingChart}
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id} style={{ background: '#0D1118', color: '#FFF' }}>
                    {p.name} {p.isPrimary ? '★ (Primary)' : `(${p.relationship})`} — {p.dateOfBirth}
                  </option>
                ))}
              </select>
            </div>

            <Link
              to={`/reports?profile=${selectedProfileId}`}
              className="btn btn-outline"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <FileText size={15} /> PDF Dossier
            </Link>

            <Link
              to={`/chat?profile=${selectedProfileId}`}
              className="btn btn-gold"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <MessageSquare size={15} /> Ask AI
            </Link>

            <Button
              variant="outline"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              onClick={() => setShowShareModal(true)}
            >
              <Share2 size={15} /> Share Kundli
            </Button>

            <Button
              variant="outline"
              style={{ padding: '8px 12px' }}
              onClick={() => handleProfileChange(selectedProfileId)}
              title="Recalculate Chart"
              disabled={loadingChart}
            >
              {loadingChart ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            </Button>
          </div>
        )}
      </div>

      {/* Share Kundli Modal */}
      {showShareModal && (
        <ShareKundliModal
          profileId={selectedProfileId}
          profileName={selectedProfile?.name || 'Vedic Native'}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Error Alert */}
      {error && (
        <div style={{ padding: '14px 18px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} flex-shrink="0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State: No profiles created */}
      {!loadingProfiles && profiles.length === 0 && (
        <Card glow style={{ textAlign: 'center', padding: '60px 24px', margin: '40px 0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245, 208, 97, 0.15)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'var(--accent-gold)' }}>
            <Compass size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No Birth Profile Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '460px', margin: '0 auto 24px auto' }}>
            To generate your authoritative Vedic Kundli and planetary positions, please create your birth profile first.
          </p>
          <Link to="/profile" className="btn btn-gold">
            <Plus size={16} /> Create Birth Profile
          </Link>
        </Card>
      )}

      {/* Loading Skeleton */}
      {loadingChart && (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', color: 'var(--accent-gold)' }} />
          <div style={{ fontSize: '1.1rem', color: '#FFF' }}>Calculating Planetary Positions & Vargas...</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            VSOP87 Ephemeris • Lahiri Ayanamsa • 12 Bhavas
          </div>
        </div>
      )}

      {/* Main Astrology Visualizer */}
      {!loadingChart && chart && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Top 3 Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '20px' }}>
            <BirthDetailsCard
              profileName={selectedProfile?.name}
              relationship={selectedProfile?.relationship}
              birthInput={chart.birthInput}
              ayanamsa={chart.ayanamsa}
            />
            <LagnaCard ascendant={chart.ascendant} houses={chart.houses} profileId={selectedProfileId} />
            <NakshatraCard moon={moon} profileId={selectedProfileId} />
          </div>

          {/* Central Chart & Table Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '24px', alignItems: 'flex-start' }}>
            {/* Left: Kundli Chart Visualizer with Multi-Style Selector */}
            <Card glow style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--accent-gold)" />
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{activeDivisionalChart?.title}</h3>
                </div>
                <ChartTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </div>

              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <ChartStyleSelector currentStyle={chartStyle} onChangeStyle={setChartStyle} />
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

            {/* Right: Detailed Planetary Table */}
            <Card style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={18} color="var(--accent-gold)" />
                  <h3 style={{ fontSize: '1.2rem' }}>Planetary Coordinates</h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click planet for full attributes</span>
              </div>

              <PlanetaryTable
                planets={chart.planets}
                ascendant={chart.ascendant}
                onSelectPlanet={handleSelectPlanetByName}
              />
            </Card>
          </div>

          {/* House Details & Aspects Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px' }}>
            <Card>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>12 Bhavas (Whole Sign Houses)</h3>
              <HouseTable houses={chart.houses} />
            </Card>

            <VedicAspectsCard aspects={chart.aspects} />
          </div>

          {/* Vimshottari Dasha Hierarchy */}
          <DashaSection dashas={chart.dashas} profileId={selectedProfileId} />

          {/* Daily Panchang & Muhurta */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '24px' }}>
            <PanchangCard
              initialPanchang={chart.panchang}
              latitude={chart.birthInput.latitude}
              longitude={chart.birthInput.longitude}
            />
            <MuhurtaCard muhurta={chart.muhurta} />
          </div>

          {/* Real-time Planetary Transits (Gochar) */}
          <TransitCard />
        </div>
      )}

      {/* Planet Detail Modal */}
      <PlanetDetailModal
        planet={selectedPlanet}
        aspects={chart?.aspects}
        profileId={selectedProfileId}
        onClose={() => setSelectedPlanet(null)}
      />
    </div>
  );
};
