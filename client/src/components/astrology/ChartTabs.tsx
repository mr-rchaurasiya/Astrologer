import React from 'react';

interface ChartTabsProps {
  activeTab: 'D1' | 'D9' | 'D10';
  onTabChange: (tab: 'D1' | 'D9' | 'D10') => void;
}

export const ChartTabs: React.FC<ChartTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { key: 'D1' | 'D9' | 'D10'; label: string; desc: string }[] = [
    { key: 'D1', label: 'D1 Rashi', desc: 'Natal Physical Chart' },
    { key: 'D9', label: 'D9 Navamsha', desc: 'Soul & Dharma Chart' },
    { key: 'D10', label: 'D10 Dashamsha', desc: 'Career & Karma Chart' },
  ];

  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)',
        width: 'fit-content',
        marginBottom: '20px',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: isActive
                ? 'linear-gradient(135deg, rgba(245, 208, 97, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)'
                : 'transparent',
              color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
              borderBottom: isActive ? '1px solid var(--border-gold)' : '1px solid transparent',
            }}
          >
            <div>{tab.label}</div>
            <div style={{ fontSize: '0.65rem', color: isActive ? 'var(--text-muted)' : 'var(--text-muted)', marginTop: '2px' }}>
              {tab.desc}
            </div>
          </button>
        );
      })}
    </div>
  );
};
