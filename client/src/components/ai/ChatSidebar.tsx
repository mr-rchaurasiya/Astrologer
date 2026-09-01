import React from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { ChatSession } from '../../types/ai';
import { Button } from '../common/Button';

interface ChatSidebarProps {
  sessions: ChatSession[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}) => {
  // Group sessions by Today, Yesterday, Older
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const todaySessions: ChatSession[] = [];
  const yesterdaySessions: ChatSession[] = [];
  const olderSessions: ChatSession[] = [];

  sessions.forEach((s) => {
    const sDate = new Date(s.updatedAt || s.lastMessageAt).toDateString();
    if (sDate === todayStr) {
      todaySessions.push(s);
    } else if (sDate === yesterdayStr) {
      yesterdaySessions.push(s);
    } else {
      olderSessions.push(s);
    }
  });

  const renderGroup = (title: string, groupList: ChatSession[]) => {
    if (groupList.length === 0) return null;
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', paddingLeft: '8px' }}>
          {title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {groupList.map((s) => {
            const isSelected = selectedSessionId === s.id;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(245, 208, 97, 0.12)' : 'transparent',
                  border: isSelected ? '1px solid var(--border-gold)' : '1px solid transparent',
                  color: isSelected ? 'var(--accent-gold)' : '#E2E8F0',
                  fontSize: '0.85rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  <MessageSquare size={14} flex-shrink="0" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this conversation?')) {
                      onDeleteSession(s.id);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Delete Session"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        borderRight: '1px solid var(--border-medium)',
        background: 'rgba(7, 9, 14, 0.95)',
      }}
    >
      <Button
        variant="gold"
        icon={<Plus size={16} />}
        style={{ width: '100%', marginBottom: '18px', fontSize: '0.875rem' }}
        onClick={onNewChat}
      >
        New Chat
      </Button>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sessions.length === 0 ? (
          <div style={{ padding: '20px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No previous conversations.
          </div>
        ) : (
          <>
            {renderGroup('Today', todaySessions)}
            {renderGroup('Yesterday', yesterdaySessions)}
            {renderGroup('Previous Inquiries', olderSessions)}
          </>
        )}
      </div>
    </div>
  );
};
