import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OfflineBanner } from '../components/pwa/OfflineBanner';
import { ChartStyleSelector } from '../components/astrology/ChartStyleSelector';
import { SouthIndianKundliChart } from '../components/astrology/SouthIndianKundliChart';
import { EastIndianKundliChart } from '../components/astrology/EastIndianKundliChart';
import { SavedConsultationCard } from '../components/consultation/SavedConsultationCard';

const mockChart: any = {
  name: 'D1 Rashi',
  title: 'D1 Rashi Chart',
  ascendantSignNumber: 1,
  placements: [
    { planet: 'Sun', signNumber: 1, house: 1 },
    { planet: 'Moon', signNumber: 4, house: 4 },
  ],
};

describe('Phase 10: Frontend Components Suite', () => {
  it('renders OfflineBanner without crashing when online', () => {
    const { container } = render(<OfflineBanner />);
    expect(container).toBeDefined();
  });

  it('renders ChartStyleSelector with 3 regional styles and switches style', () => {
    const onChange = vi.fn();
    render(<ChartStyleSelector currentStyle="north" onChangeStyle={onChange} />);

    expect(screen.getByText('North Indian')).toBeDefined();
    expect(screen.getByText('South Indian')).toBeDefined();
    expect(screen.getByText('East Indian')).toBeDefined();

    fireEvent.click(screen.getByText('South Indian'));
    expect(onChange).toHaveBeenCalledWith('south');
  });

  it('renders SouthIndianKundliChart SVG with correct title', () => {
    render(<SouthIndianKundliChart chart={mockChart} />);
    expect(screen.getByText('D1 Rashi')).toBeDefined();
    expect(screen.getByText('SOUTH INDIAN')).toBeDefined();
  });

  it('renders EastIndianKundliChart SVG with correct title', () => {
    render(<EastIndianKundliChart chart={mockChart} />);
    expect(screen.getByText('D1 Rashi')).toBeDefined();
    expect(screen.getByText('EAST INDIAN')).toBeDefined();
  });

  it('renders SavedConsultationCard with title and tag badges', () => {
    const item = {
      id: 'saved_1',
      sessionId: 'session_1',
      title: 'Saturn Transit 2026',
      tags: ['saturn', 'remedy'],
      isFavorite: true,
      isArchived: false,
      notes: 'Light mustard lamp',
      createdAt: new Date().toISOString(),
    };

    render(
      <BrowserRouter>
        <SavedConsultationCard
          item={item}
          onToggleFavorite={vi.fn()}
          onToggleArchive={vi.fn()}
          onDelete={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Saturn Transit 2026')).toBeDefined();
    expect(screen.getByText('#saturn')).toBeDefined();
    expect(screen.getByText('#remedy')).toBeDefined();
  });
});
