import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useHealth } from '../hooks/useHealth';
import { OfflineBanner } from '../components/pwa/OfflineBanner';
import { PWAUpdatePrompt } from '../components/pwa/PWAUpdatePrompt';
import { InstallAppPrompt } from '../components/pwa/InstallAppPrompt';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { MobileDrawer } from '../components/layout/MobileDrawer';
import { CosmicBackground } from '../components/layout/CosmicBackground';

export const MainLayout: React.FC = () => {
  const { status } = useHealth();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <div
      style={{
        minHeight: '100vh',
        height: isChatPage ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: isChatPage ? 'hidden' : 'visible',
      }}
    >
      <CosmicBackground />
      <OfflineBanner />
      <Navbar serverStatus={status} onOpenDrawer={() => setIsDrawerOpen(true)} />
      <main
        style={{
          flex: 1,
          paddingBottom: isChatPage ? 0 : '70px',
          display: isChatPage ? 'flex' : 'block',
          flexDirection: isChatPage ? 'column' : undefined,
          minHeight: 0,
          overflow: isChatPage ? 'hidden' : 'visible',
        }}
      >
        <Outlet />
      </main>
      <MobileBottomNav onOpenDrawer={() => setIsDrawerOpen(true)} />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <PWAUpdatePrompt />
      <InstallAppPrompt />
      {!isChatPage && <Footer />}
    </div>
  );
};
