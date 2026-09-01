import React from 'react';
import { InAppNotification } from '../../types/notifications';
import { Sparkles, Compass, Zap, FileText, Bell, CheckCheck, X } from 'lucide-react';

interface NotificationPanelProps {
  notifications: InAppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'daily_insight':
        return <Sparkles size={16} color="var(--accent-gold)" />;
      case 'transit':
        return <Compass size={16} color="#60A5FA" />;
      case 'subscription':
      case 'payment':
        return <Zap size={16} color="#34D399" />;
      case 'report':
        return <FileText size={16} color="#C084FC" />;
      default:
        return <Bell size={16} color="#94A3B8" />;
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: '60px',
        right: '0',
        width: '360px',
        maxHeight: '480px',
        borderRadius: '14px',
        border: '1px solid var(--border-gold)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 208, 97, 0.15)',
        background: 'rgba(13, 17, 24, 0.98)',
        backdropFilter: 'blur(16px)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} color="var(--accent-gold)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>Notifications</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onMarkAllRead}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-gold)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recent notifications.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onMarkRead(notif.id)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '6px',
                background: notif.isRead ? 'transparent' : 'rgba(245, 208, 97, 0.06)',
                border: notif.isRead ? '1px solid transparent' : '1px solid rgba(245, 208, 97, 0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0 }}>{getIcon(notif.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: notif.isRead ? 500 : 700, color: '#FFF' }}>
                  {notif.title}
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                  {notif.message}
                </div>
                <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {!notif.isRead && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-gold)', marginTop: '6px', flexShrink: 0 }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
