import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export const AIThinkingIndicator: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        maxWidth: '85%',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
          border: '1px solid var(--border-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--accent-gold)',
        }}
      >
        <Sparkles size={18} />
      </div>

      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          borderRadius: '4px 16px 16px 16px',
          border: '1px solid var(--border-gold)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--accent-gold)',
          fontSize: '0.875rem',
        }}
      >
        <Loader2 size={16} className="animate-spin" />
        <span>Consulting astrological calculation engine & synthesizing interpretation...</span>
      </div>
    </div>
  );
};
