import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationPanel } from '../components/notifications/NotificationPanel';
import { VoicePlayer } from '../components/ai/VoicePlayer';
import { InAppNotification } from '../types/notifications';
import { AdminRoute } from '../components/common/AdminRoute';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin1', name: 'Admin', email: 'admin@test.com', role: 'admin' },
    isAuthenticated: true,
    loading: false,
  }),
}));

describe('Phase 7: Frontend UI Components', () => {
  it('renders NotificationPanel with notifications', () => {
    const mockNotifs: InAppNotification[] = [
      {
        id: 'notif-1',
        userId: 'u1',
        type: 'daily_insight',
        title: 'Daily Vedic Alignment',
        message: 'Jupiter in 9th house brings wisdom.',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];

    render(
      <NotificationPanel
        notifications={mockNotifs}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Notifications')).toBeDefined();
    expect(screen.getByText('Daily Vedic Alignment')).toBeDefined();
    expect(screen.getByText('Jupiter in 9th house brings wisdom.')).toBeDefined();
  });

  it('renders VoicePlayer button with text reading', () => {
    render(<VoicePlayer text="Your ascendant is Leo ruled by the Sun." />);
    expect(screen.getByText('Listen')).toBeDefined();
  });

  it('AdminRoute allows admin user to access protected page', () => {
    render(
      <BrowserRouter>
        <AdminRoute>
          <div>Protected Admin Panel Content</div>
        </AdminRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Admin Panel Content')).toBeDefined();
  });
});
