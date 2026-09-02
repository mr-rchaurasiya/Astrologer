import React from 'react';
import { User, Sparkles, Clock, Target } from 'lucide-react';
import { ChatMessage } from '../../types/ai';
import { VoicePlayer } from './VoicePlayer';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Helper to parse inline bold (**text**), italics (*text*), and code (`text`)
  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Regex matches **bold**, *italic*, `code`, or regular text
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={pIdx} style={{ color: 'var(--accent-gold, #F5D061)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return <em key={pIdx} style={{ fontStyle: 'italic', color: '#E2E8F0' }}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={pIdx}
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.08)',
              color: '#F5D061',
              fontSize: '0.88em',
              fontFamily: 'monospace',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Format full markdown safely (headings, lists, blockquotes, tables, paragraphs)
  const formatContent = (rawText: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let tableBuffer: string[] = [];

    const flushTable = (key: number) => {
      if (tableBuffer.length === 0) return null;
      const rows = tableBuffer
        .filter((l) => !l.match(/^\s*\|?\s*[-:]+[-| :]*\s*\|?\s*$/)) // filter separator row like |---|---|
        .map((l) =>
          l
            .split('|')
            .map((c) => c.trim())
            .filter((c, idx, arr) => (idx !== 0 && idx !== arr.length - 1) || c.length > 0)
        );

      if (rows.length === 0) {
        tableBuffer = [];
        return null;
      }

      const headers = rows[0];
      const bodyRows = rows.slice(1);

      const tableEl = (
        <div
          key={`table-${key}`}
          style={{
            width: '100%',
            overflowX: 'auto',
            margin: '12px 0',
            borderRadius: '8px',
            border: '1px solid var(--border-medium, rgba(245, 208, 97, 0.2))',
            background: 'rgba(0, 0, 0, 0.35)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.88em',
            }}
          >
            {headers && headers.length > 0 && (
              <thead>
                <tr style={{ background: 'rgba(245, 208, 97, 0.12)', borderBottom: '1px solid var(--border-medium)' }}>
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} style={{ padding: '8px 12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                      {parseInlineMarkdown(h)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: rIdx !== bodyRows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '8px 12px', verticalAlign: 'top', color: '#E2E8F0' }}>
                      {parseInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      tableBuffer = [];
      return tableEl;
    };

    lines.forEach((line, lIdx) => {
      // If line is part of a markdown table
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        tableBuffer.push(line);
        return;
      }

      // If we were accumulating table lines and now hit a non-table line
      if (tableBuffer.length > 0) {
        const t = flushTable(lIdx);
        if (t) elements.push(t);
      }

      // Heading 3 / ###
      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={lIdx} style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent-gold)', marginTop: '12px', marginBottom: '6px' }}>
            {parseInlineMarkdown(line.substring(4))}
          </h4>
        );
        return;
      }

      // Heading 2 / ##
      if (line.startsWith('## ')) {
        elements.push(
          <h3 key={lIdx} style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '14px', marginBottom: '8px' }}>
            {parseInlineMarkdown(line.substring(3))}
          </h3>
        );
        return;
      }

      // Blockquote / >
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={lIdx}
            style={{
              margin: '8px 0',
              padding: '6px 12px',
              borderLeft: '3px solid var(--accent-gold)',
              background: 'rgba(245, 208, 97, 0.08)',
              borderRadius: '0 6px 6px 0',
              color: '#F1F5F9',
              fontStyle: 'italic',
            }}
          >
            {parseInlineMarkdown(line.substring(2))}
          </blockquote>
        );
        return;
      }

      // Bullet list item
      if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
        elements.push(
          <li key={lIdx} style={{ marginLeft: '18px', marginBottom: '4px', lineHeight: 1.5, color: '#F1F5F9' }}>
            {parseInlineMarkdown(line.substring(2))}
          </li>
        );
        return;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={lIdx} style={{ height: '8px' }} />);
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={lIdx} style={{ marginBottom: '6px', lineHeight: 1.6, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {parseInlineMarkdown(line)}
        </p>
      );
    });

    if (tableBuffer.length > 0) {
      const t = flushTable(lines.length);
      if (t) elements.push(t);
    }

    return elements;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '18px',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          maxWidth: isUser ? 'min(82%, 680px)' : '100%',
          width: isUser ? 'auto' : '100%',
          flexDirection: isUser ? 'row-reverse' : 'row',
          boxSizing: 'border-box',
          minWidth: 0,
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
            minWidth: 0,
            maxWidth: '100%',
            padding: '12px 18px',
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
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            boxSizing: 'border-box',
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
