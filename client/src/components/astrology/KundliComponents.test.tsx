import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { KundliChart } from './KundliChart';
import { ChartTabs } from './ChartTabs';
import { PlanetaryTable } from './PlanetaryTable';
import { LagnaCard } from './LagnaCard';
import { BirthDetailsCard } from './BirthDetailsCard';
import { DashaSection } from './DashaSection';
import { PanchangCard } from './PanchangCard';
import { MuhurtaCard } from './MuhurtaCard';
import { DivisionalChart, PlanetPosition, AscendantInfo, HouseInfo, VimshottariDashaTree, PanchangInfo, MuhurtaInfo } from '../../types';

describe('Vedic Astrology Visualization Components', () => {
  const mockChart: DivisionalChart = {
    name: 'D1',
    title: 'Rashi Chart',
    ascendantSign: 'Taurus',
    ascendantSignNumber: 2,
    placements: [
      { planet: 'Ascendant', sign: 'Taurus', signNumber: 2, degree: 15.0, house: 1 },
      { planet: 'Sun', sign: 'Taurus', signNumber: 2, degree: 0.5, house: 1 },
      { planet: 'Moon', sign: 'Cancer', signNumber: 4, degree: 12.0, house: 3 },
      { planet: 'Jupiter', sign: 'Leo', signNumber: 5, degree: 18.0, house: 4 },
    ],
  };

  const mockAscendant: AscendantInfo = {
    longitude: 45.0,
    tropicalLongitude: 68.7,
    sign: 'Taurus',
    signNumber: 2,
    signDegree: 15.0,
    nakshatra: 'Rohini',
    nakshatraNumber: 4,
    nakshatraLord: 'Moon',
    pada: 2,
  };

  const mockPlanets: PlanetPosition[] = [
    {
      name: 'Sun',
      longitude: 30.5,
      tropicalLongitude: 54.2,
      latitude: 0,
      speed: 1.0,
      retrograde: false,
      sign: 'Taurus',
      signNumber: 2,
      signDegree: 0.5,
      house: 1,
      nakshatra: 'Krittika',
      nakshatraNumber: 3,
      nakshatraLord: 'Sun',
      pada: 2,
      combust: false,
      dignity: 'enemy',
    },
    {
      name: 'Moon',
      longitude: 102.0,
      tropicalLongitude: 125.7,
      latitude: 1.2,
      speed: 13.5,
      retrograde: false,
      sign: 'Cancer',
      signNumber: 4,
      signDegree: 12.0,
      house: 3,
      nakshatra: 'Pushya',
      nakshatraNumber: 8,
      nakshatraLord: 'Saturn',
      pada: 3,
      combust: false,
      dignity: 'own',
    },
  ];

  const mockHouses: HouseInfo[] = [
    {
      houseNumber: 1,
      sign: 'Taurus',
      signNumber: 2,
      startDegree: 30,
      midDegree: 45,
      endDegree: 60,
      lord: 'Venus',
      occupants: ['Sun'],
    },
  ];

  const mockDashas: VimshottariDashaTree = {
    balanceAtBirthYears: 5.5,
    startingLord: 'Saturn',
    mahadashas: [
      {
        lord: 'Saturn',
        startDate: '2020-01-01T00:00:00.000Z',
        endDate: '2030-01-01T00:00:00.000Z',
        durationYears: 10,
        subPeriods: [
          {
            lord: 'Saturn',
            startDate: '2020-01-01T00:00:00.000Z',
            endDate: '2023-01-01T00:00:00.000Z',
            durationYears: 3,
          },
        ],
      },
      {
        lord: 'Mercury',
        startDate: '2030-01-01T00:00:00.000Z',
        endDate: '2047-01-01T00:00:00.000Z',
        durationYears: 17,
      },
    ],
  };

  const mockPanchang: PanchangInfo = {
    date: '2024-05-15',
    tithi: { number: 7, name: 'Saptami', paksha: 'Shukla', percentage: 45.0 },
    vara: { number: 3, name: 'Budhavara (Wednesday)', rulingPlanet: 'Mercury' },
    nakshatra: { number: 8, name: 'Pushya', lord: 'Saturn', degreeInNakshatra: 4.5 },
    yoga: { number: 5, name: 'Shobhana' },
    karana: { number: 13, name: 'Gara', type: 'movable' },
    sunTimes: {
      sunrise: '2024-05-15T05:40:00.000Z',
      sunset: '2024-05-15T18:50:00.000Z',
      solarNoon: '2024-05-15T12:15:00.000Z',
      dayDurationMinutes: 790,
    },
  };

  const mockMuhurta: MuhurtaInfo = {
    date: '2024-05-15',
    rahuKaal: { name: 'Rahu Kaal', startTime: '2024-05-15T12:00:00Z', endTime: '2024-05-15T13:30:00Z', type: 'inauspicious', description: 'Inauspicious' },
    gulikaKaal: { name: 'Gulika Kaal', startTime: '2024-05-15T10:30:00Z', endTime: '2024-05-15T12:00:00Z', type: 'inauspicious', description: 'Gulika window' },
    yamagandaKaal: { name: 'Yamaganda Kaal', startTime: '2024-05-15T07:30:00Z', endTime: '2024-05-15T09:00:00Z', type: 'inauspicious', description: 'Yama window' },
    abhijitMuhurta: { name: 'Abhijit Muhurta', startTime: '2024-05-15T11:45:00Z', endTime: '2024-05-15T12:35:00Z', type: 'auspicious', description: 'Auspicious' },
    brahmaMuhurta: { name: 'Brahma Muhurta', startTime: '2024-05-15T04:04:00Z', endTime: '2024-05-15T04:52:00Z', type: 'auspicious', description: 'Pre-dawn sacred window' },
  };

  it('KundliChart renders North Indian SVG chart with house numbers and planets', () => {
    render(<KundliChart chart={mockChart} planetsInfo={mockPlanets} />);
    expect(screen.getByRole('img')).toBeDefined();
    expect(screen.getAllByText('Asc').length).toBeGreaterThan(0);
    expect(screen.getByText(/North Indian/i)).toBeDefined();
  });

  it('ChartTabs allows switching between D1, D9, and D10', () => {
    const onTabChange = vi.fn();
    render(<ChartTabs activeTab="D1" onTabChange={onTabChange} />);

    const d9Tab = screen.getByText('D9 Navamsha');
    fireEvent.click(d9Tab);
    expect(onTabChange).toHaveBeenCalledWith('D9');
  });

  it('PlanetaryTable renders planets and triggers selection callback', () => {
    const onSelectPlanet = vi.fn();
    render(<PlanetaryTable planets={mockPlanets} ascendant={mockAscendant} onSelectPlanet={onSelectPlanet} />);

    expect(screen.getByText('Sun')).toBeDefined();
    expect(screen.getByText('Moon')).toBeDefined();

    fireEvent.click(screen.getByText('Sun'));
    expect(onSelectPlanet).toHaveBeenCalledWith('Sun');
  });

  it('LagnaCard renders Ascendant sign, degree, and lord', () => {
    render(
      <MemoryRouter>
        <LagnaCard ascendant={mockAscendant} houses={mockHouses} />
      </MemoryRouter>
    );
    expect(screen.getByText('Ascendant (Lagna)')).toBeDefined();
    expect(screen.getAllByText('Taurus').length).toBeGreaterThan(0);
    expect(screen.getByText('Venus')).toBeDefined();
  });

  it('BirthDetailsCard renders formatted birth inputs', () => {
    render(
      <BirthDetailsCard
        profileName="Test Native"
        relationship="self"
        birthInput={{
          dateOfBirth: '1995-05-15',
          timeOfBirth: '08:30:00',
          latitude: 23.1765,
          longitude: 75.7885,
          timezone: 'Asia/Kolkata',
          timezoneOffset: 5.5,
          utcDateTime: '1995-05-15T03:00:00.000Z',
          julianDay: 2449852.625,
        }}
        ayanamsa={{ system: 'Lahiri', value: 23.79, formatted: '23° 47\' 24"' }}
      />
    );
    expect(screen.getByText('Test Native')).toBeDefined();
    expect(screen.getByText('1995-05-15')).toBeDefined();
  });

  it('DashaSection renders Mahadasha hierarchy and timeline bar', () => {
    render(
      <MemoryRouter>
        <DashaSection dashas={mockDashas} />
      </MemoryRouter>
    );
    expect(screen.getByText(/120-Year Vimshottari Dasha Hierarchy/i)).toBeDefined();
    expect(screen.getByText(/Saturn Mahadasha/i)).toBeDefined();
  });

  it('PanchangCard renders 5 limbs and sun times', () => {
    render(<PanchangCard initialPanchang={mockPanchang} />);
    expect(screen.getByText('Daily Vedic Panchang')).toBeDefined();
    expect(screen.getByText('Saptami')).toBeDefined();
    expect(screen.getByText('Pushya')).toBeDefined();
  });

  it('MuhurtaCard renders Rahu Kaal, Abhijit, and Brahma Muhurta', () => {
    render(<MuhurtaCard muhurta={mockMuhurta} />);
    expect(screen.getByText('Auspicious & Inauspicious Muhurtas')).toBeDefined();
    expect(screen.getByText('Rahu Kaal')).toBeDefined();
    expect(screen.getByText('Abhijit Muhurta')).toBeDefined();
    expect(screen.getByText('Brahma Muhurta')).toBeDefined();
  });
});
