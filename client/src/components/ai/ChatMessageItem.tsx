import React from 'react';
import { User, Sparkles, Clock, Target } from 'lucide-react';
import { ChatMessage } from '../../types/ai';
import { VoicePlayer } from './VoicePlayer';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Format basic markdown (bold, italic, lists, paragraphs) safely without arbitrary HTML
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Heading 3 / ###
      if (line.startsWith('### ')) {
        return (
          <h4 key={lIdx} style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-gold)', marginTop: '12px', marginBottom: '6px' }}>
            {line.substring(4)}
          </h4>
        );
      }
      // Heading 2 / ##
      if (line.startsWith('## ')) {
        return (
          <h3 key={lIdx} style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '14px', marginBottom: '8px' }}>
            {line.substring(3)}
          </h3>
        );
      }
      // Bullet list item
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={lIdx} style={{ marginLeft: '18px', marginBottom: '4px', lineHeight: 1.5 }}>
            {line.substring(2)}
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={lIdx} style={{ height: '8px' }} />;
      }

      return (
        <p key={lIdx} style={{ marginBottom: '6px', lineHeight: 1.6 }}>
          {line}
        </p>
      );
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '20px',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          maxWidth: isUser ? '82%' : '98%',
          width: isUser ? 'auto' : '100%',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: isUser
              ? 'rgba(99, 102, 241, 0.2)'
              : 'linear-gradient(135deg, rgba(245, 208, 97, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
            border: `1px solid ${isUser ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-gold)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: isUser ? '#818CF8' : 'var(--accent-gold)',
          }}
        >
          {isUser ? <User size={18} /> : <Sparkles size={18} />}
        </div>

        {/* Message Bubble */}
        <div
          style={{
            flex: isUser ? undefined : 1,
            padding: '14px 20px',
            borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            background: isUser
              ? 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)'
              : 'rgba(13, 17, 24, 0.85)',
            border: isUser ? '1px solid rgba(129, 140, 248, 0.3)' : '1px solid var(--border-medium)',
            boxShadow: isUser
              ? '0 4px 14px rgba(79, 70, 229, 0.25)'
              : '0 4px 16px rgba(0, 0, 0, 0.4)',
            color: '#F8FAFC',
            fontSize: 'inherit',
            lineHeight: 1.65,
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Point & Ask Badge if present */}
          {message.metadata?.selectedPoint && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(245, 208, 97, 0.15)',
                border: '1px solid var(--border-gold)',
                color: 'var(--accent-gold)',
                fontSize: '0.72rem',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              <Target size={11} />
              <span>Point & Ask: {message.metadata.selectedPoint.label || message.metadata.selectedPoint.id}</span>
            </div>
          )}

          <div>{formatContent(message.content)}</div>

          {/* Footer Timestamp, Model & Voice Player */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isUser ? 'flex-end' : 'space-between',
              gap: '10px',
              marginTop: '8px',
              paddingTop: '6px',
              borderTop: isUser ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.04)',
              fontSize: '0.7rem',
              color: isUser ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-muted)',
            }}
          >
            {!isUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <VoicePlayer text={message.content} />
                {message.metadata?.model && <span>{message.metadata.model}</span>}
              </div>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={10} />
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
