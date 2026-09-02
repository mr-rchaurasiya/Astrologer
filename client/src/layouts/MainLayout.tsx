import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <CosmicBackground />
      <OfflineBanner />
      <Navbar serverStatus={status} onOpenDrawer={() => setIsDrawerOpen(true)} />
      <main style={{ flex: 1, paddingBottom: '70px' }}>
        <Outlet />
      </main>
      <MobileBottomNav onOpenDrawer={() => setIsDrawerOpen(true)} />
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <PWAUpdatePrompt />
      <InstallAppPrompt />
      <Footer />
    </div>
  );
};
