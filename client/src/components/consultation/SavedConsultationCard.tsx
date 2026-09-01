import React from 'react';
import { Star, Calendar, Trash2, Archive, MessageSquare } from 'lucide-react';
import { SavedConsultationItem } from '../../services/savedConsultationApi';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Link } from 'react-router-dom';

interface SavedConsultationCardProps {
  item: SavedConsultationItem;
  onToggleFavorite: (id: string, isFav: boolean) => void;
  onToggleArchive: (id: string, isArch: boolean) => void;
  onDelete: (id: string) => void;
}

export const SavedConsultationCard: React.FC<SavedConsultationCardProps> = ({
  item,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
}) => {
  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        border: item.isFavorite ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#FFF', fontWeight: 600 }}>{item.title}</h4>
        <button
          onClick={() => onToggleFavorite(item.id, !item.isFavorite)}
          style={{
            background: 'none',
            border: 'none',
            color: item.isFavorite ? 'var(--gold-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
          }}
          title={item.isFavorite ? 'Unstar' : 'Star reading'}
        >
          <Star size={18} fill={item.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {item.notes && (
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {item.notes}
        </p>
      )}

      {item.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {item.tags.map((tag) => (
            <Badge key={tag} variant="gold">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} /> {new Date(item.createdAt).toLocaleDateString()}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to={`/chat?session=${item.sessionId}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--gold-primary)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <MessageSquare size={13} /> Open Chat
          </Link>
          <button
            onClick={() => onToggleArchive(item.id, !item.isArchived)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            title={item.isArchived ? 'Unarchive' : 'Archive'}
          >
            <Archive size={14} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
            title="Delete saved reading"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
};
