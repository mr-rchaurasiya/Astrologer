import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, MessageSquare } from 'lucide-react';
import { Button } from '../common/Button';
import { PersonalizationApi } from '../../services/personalizationApi';

interface AIFeedbackModalProps {
  messageId: string;
  sessionId?: string;
  initialRating: 'helpful' | 'not_helpful';
  onClose: () => void;
  onSubmitted: () => void;
}

export const AIFeedbackModal: React.FC<AIFeedbackModalProps> = ({
  messageId,
  sessionId,
  initialRating,
  onClose,
  onSubmitted,
}) => {
  const [rating, setRating] = useState<'helpful' | 'not_helpful'>(initialRating);
  const [category, setCategory] = useState<string>('accuracy');
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await PersonalizationApi.submitFeedback({
        messageId,
        sessionId,
        rating,
        category,
        comment,
      });
      onSubmitted();
    } catch {
      // Graceful close on error
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 9, 14, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'linear-gradient(145deg, #0D1118 0%, #151C28 100%)',
          borderRadius: '16px',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-gold)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--gold-primary)" /> AI Response Quality Feedback
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setRating('helpful')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: rating === 'helpful' ? '1px solid #10B981' : '1px solid var(--border-subtle)',
                background: rating === 'helpful' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: rating === 'helpful' ? '#10B981' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <ThumbsUp size={16} /> Helpful
            </button>
            <button
              type="button"
              onClick={() => setRating('not_helpful')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: rating === 'not_helpful' ? '1px solid #EF4444' : '1px solid var(--border-subtle)',
                background: rating === 'not_helpful' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                color: rating === 'not_helpful' ? '#EF4444' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <ThumbsDown size={16} /> Needs Work
            </button>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Feedback Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
              style={{ width: '100%', padding: '8px', background: '#07090E', color: '#FFF', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
            >
              <option value="accuracy">Vedic Astrological Accuracy</option>
              <option value="clarity">Clarity & Explanations</option>
              <option value="depth">Depth of Remedies</option>
              <option value="tone">Tone & Persona</option>
              <option value="hallucination">Factual Contradiction</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what made this reading helpful or how we can improve..."
              maxLength={500}
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                background: '#07090E',
                color: '#FFF',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <Button variant="outline" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="gold" size="sm" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
