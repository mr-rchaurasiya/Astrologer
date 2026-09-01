import React from 'react';

export type ChartStyle = 'north' | 'south' | 'east';

interface ChartStyleSelectorProps {
  currentStyle: ChartStyle;
  onChangeStyle: (style: ChartStyle) => void;
}

export const ChartStyleSelector: React.FC<ChartStyleSelectorProps> = ({ currentStyle, onChangeStyle }) => {
  const styles: { id: ChartStyle; label: string; description: string }[] = [
    { id: 'north', label: 'North Indian', description: 'Diamond format (Fixed Houses, Moving Signs)' },
    { id: 'south', label: 'South Indian', description: 'Box grid format (Fixed Signs, Moving Houses)' },
    { id: 'east', label: 'East Indian', description: 'Bengali / Oriya format (Fixed Aries Top)' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div
        style={{
          display: 'inline-flex',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {styles.map((s) => {
          const isActive = currentStyle === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChangeStyle(s.id)}
              title={s.description}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: isActive ? 'var(--gold-primary)' : 'transparent',
                color: isActive ? '#07090E' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.825rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
