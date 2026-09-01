import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from '../common/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detect if running already as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Check if dismissed in this session
    const dismissed = sessionStorage.getItem('pwa_install_dismissed');
    if (dismissed) {
      return;
    }

    // 3. Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. iOS Safari detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/crios|fxios|chrome/.test(ua);

    if (isIosDevice && isSafari) {
      setIsIOS(true);
      // Wait 3 seconds before gentle prompt on iOS
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!isVisible || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '72px',
        left: '16px',
        right: '16px',
        maxWidth: '380px',
        margin: '0 auto',
        padding: '16px',
        borderRadius: '14px',
        background: 'rgba(13, 17, 24, 0.96)',
        border: '1px solid var(--border-gold)',
        boxShadow: 'var(--shadow-gold)',
        backdropFilter: 'blur(16px)',
        zIndex: 9997,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <strong style={{ color: 'var(--gold-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Download size={16} /> Install Astrologer App
        </strong>
        <button
          onClick={handleDismiss}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          aria-label="Dismiss app install"
        >
          <X size={16} />
        </button>
      </div>

      {!showIOSInstructions ? (
        <>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Install on your device for instant launch, offline chart viewing, and full-screen experience.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <Button variant="gold" size="sm" onClick={handleInstall} style={{ flex: 1 }}>
              {isIOS ? 'How to Install' : 'Install App'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDismiss}>
              Not Now
            </Button>
          </div>
        </>
      ) : (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ margin: 0 }}>To install on iOS:</p>
          <ol style={{ margin: '0 0 0 16px', padding: 0, lineHeight: 1.5 }}>
            <li>Tap the <Share size={12} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--accent-gold)' }} /> <strong>Share</strong> button in Safari</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
          </ol>
          <Button variant="outline" size="sm" onClick={handleDismiss} style={{ marginTop: '6px' }}>
            Got It
          </Button>
        </div>
      )}
    </div>
  );
};
