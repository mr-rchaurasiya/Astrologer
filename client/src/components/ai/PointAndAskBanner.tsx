import React from 'react';
import { Target, X } from 'lucide-react';
import { PointContext } from '../../types/ai';

interface PointAndAskBannerProps {
  pointContext: PointContext | null;
  onClear: () => void;
}

export const PointAndAskBanner: React.FC<PointAndAskBannerProps> = ({ pointContext, onClear }) => {
  if (!pointContext) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '1px solid var(--border-gold)',
        marginBottom: '12px',
        fontSize: '0.85rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)' }}>
        <Target size={16} />
        <span>
          <strong>Point & Ask Context:</strong> {pointContext.label || `${pointContext.type.toUpperCase()}: ${pointContext.id}`}
        </span>
      </div>
      <button
        onClick={onClear}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
        title="Clear Point & Ask context"
      >
        <X size={16} />
      </button>
    </div>
  );
};
