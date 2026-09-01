import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '../common/Button';

export const PWAUpdatePrompt: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                setWaitingWorker(newWorker);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        maxWidth: '380px',
        padding: '16px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #0D1118 0%, #151C28 100%)',
        border: '1px solid var(--border-gold)',
        boxShadow: 'var(--shadow-gold)',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <strong style={{ color: 'var(--gold-primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={16} /> New Version Available
        </strong>
        <button
          onClick={() => setUpdateAvailable(false)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          aria-label="Dismiss update"
        >
          <X size={16} />
        </button>
      </div>
      <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
        A newer version of Astrologer is ready with enhanced chart rendering and performance improvements.
      </p>
      <Button variant="gold" size="sm" onClick={handleUpdate} style={{ marginTop: '4px' }}>
        Update Application Now
      </Button>
    </div>
  );
};
