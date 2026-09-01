import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';
import { PointContext } from '../../types/ai';

interface QuickQuestionsProps {
  pointContext: PointContext | null;
  onSelectQuestion: (question: string) => void;
}

export const QuickQuestions: React.FC<QuickQuestionsProps> = ({ pointContext, onSelectQuestion }) => {
  let suggestions: string[] = [];

  if (pointContext) {
    switch (pointContext.type) {
      case 'planet':
        suggestions = [
          `What does ${pointContext.id} indicate in my birth chart?`,
          `How does ${pointContext.id} placement and dignity impact me traditionally?`,
          `Which houses does ${pointContext.id} aspect or influence in my Kundli?`,
        ];
        break;
      case 'house':
        suggestions = [
          `What is the traditional significance of my House ${pointContext.id}?`,
          `Which planets influence my House ${pointContext.id}?`,
          `What does the lord of House ${pointContext.id} indicate in my chart?`,
        ];
        break;
      case 'nakshatra':
        suggestions = [
          `Explain my birth Nakshatra (${pointContext.id}) and its ruling deity/planet.`,
          `What are the core traditional traits of my Nakshatra Pada?`,
        ];
        break;
      case 'dasha':
        suggestions = [
          `What are the traditional indications of the ${pointContext.id} Dasha period?`,
          `How should I navigate my current Dasha progression according to Parashari principles?`,
        ];
        break;
      default:
        suggestions = [
          'Give me an overview of my calculated birth chart.',
          'What are the strongest planetary placements in my Kundli?',
        ];
    }
  } else {
    suggestions = [
      'Give me an overview of my calculated birth chart.',
      'What does my 10th house indicate about career traditionally?',
      'Explain the significance of my current Vimshottari Mahadasha.',
      'What are the most auspicious planetary dignities in my chart?',
    ];
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <HelpCircle size={13} />
        <span>Suggested Questions:</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {suggestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-gold)';
              e.currentTarget.style.color = 'var(--accent-gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Sparkles size={11} color="var(--accent-gold)" />
            <span>{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
