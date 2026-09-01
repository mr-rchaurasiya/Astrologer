import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = false, style = {} }) => {
  return (
    <div
      className={`glass-card ${className}`}
      style={{
        ...(glow ? { borderColor: 'var(--border-gold)', boxShadow: 'var(--shadow-gold)' } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
