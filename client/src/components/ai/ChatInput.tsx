import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Mic } from 'lucide-react';
import { Button } from '../common/Button';
import { VoiceRecorder } from './VoiceRecorder';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopGeneration?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  prefillMessage?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  disabled = false,
  isGenerating = false,
  prefillMessage = '',
}) => {
  const [text, setText] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (prefillMessage) {
      setText(prefillMessage);
      textareaRef.current?.focus();
    }
  }, [prefillMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || disabled || isGenerating) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-adjust height up to 140px
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleVoiceTranscribed = (transcribedText: string) => {
    setIsVoiceRecording(false);
    if (transcribedText.trim()) {
      onSendMessage(transcribedText.trim());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {isVoiceRecording && (
        <VoiceRecorder
          onTranscribed={handleVoiceTranscribed}
          onCancel={() => setIsVoiceRecording(false)}
        />
      )}

      <div
        className="glass-panel"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '12px 16px',
          borderRadius: '14px',
          background: 'rgba(13, 17, 24, 0.95)',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-gold)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <textarea
            ref={textareaRef}
            className="input-field"
            style={{
              minHeight: '44px',
              maxHeight: '140px',
              resize: 'none',
              border: 'none',
              background: 'transparent',
              padding: '8px 0',
              fontSize: '0.925rem',
              lineHeight: 1.5,
            }}
            placeholder="Ask anything about your Vedic Kundli, planets, houses, dashas..."
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isGenerating}
            maxLength={4000}
            rows={1}
          />

          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '8px 10px', color: isVoiceRecording ? 'var(--accent-gold)' : 'var(--text-secondary)' }}
            onClick={() => setIsVoiceRecording(!isVoiceRecording)}
            disabled={disabled || isGenerating}
            title="Speak Question (Voice AI)"
          >
            <Mic size={16} />
          </button>

          {isGenerating ? (
            <Button
              type="button"
              variant="outline"
              style={{ padding: '8px 14px', fontSize: '0.8rem', color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              onClick={onStopGeneration}
            >
              <Square size={14} fill="#FCA5A5" /> Stop
            </Button>
          ) : (
            <Button
              type="button"
              variant="gold"
              style={{ padding: '8px 16px' }}
              onClick={handleSubmit}
              disabled={!text.trim() || disabled}
            >
              <Send size={15} />
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line</span>
          <span>{text.length} / 4000</span>
        </div>
      </div>
    </div>
  );
};
