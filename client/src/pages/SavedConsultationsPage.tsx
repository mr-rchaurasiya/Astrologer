import React, { useState, useEffect } from 'react';
import { Bookmark, Search, Star, Archive, Loader2, Sparkles, Filter } from 'lucide-react';
import { SavedConsultationApi, SavedConsultationItem } from '../services/savedConsultationApi';
import { SavedConsultationCard } from '../components/consultation/SavedConsultationCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

export const SavedConsultationsPage: React.FC = () => {
  const [items, setItems] = useState<SavedConsultationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [favoriteOnly, setFavoriteOnly] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [activeTag, setActiveTag] = useState<string>('');

  const loadSaved = async () => {
    setLoading(true);
    try {
      const res = await SavedConsultationApi.listSaved({
        search: search.trim() || undefined,
        favorite: favoriteOnly || undefined,
        archived: showArchived || undefined,
        tag: activeTag || undefined,
      });
      if (res.success && res.data?.consultations) {
        setItems(res.data.consultations);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [favoriteOnly, showArchived, activeTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSaved();
  };

  const handleToggleFavorite = async (id: string, isFav: boolean) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, isFavorite: isFav } : item)));
    await SavedConsultationApi.updateSaved(id, { isFavorite: isFav });
  };

  const handleToggleArchive = async (id: string, isArch: boolean) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    await SavedConsultationApi.updateSaved(id, { isArchived: isArch });
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    await SavedConsultationApi.deleteSaved(id);
  };

  // Collect all unique tags
  const allTags = Array.from(new Set(items.flatMap((i) => i.tags)));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bookmark size={24} color="var(--gold-primary)" /> Saved Consultations
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Archive, search, and review your important Vedic AI consultation readings
          </p>
        </div>

        <Link to="/chat" className="btn btn-gold">
          <Sparkles size={16} /> New Consultation
        </Link>
      </div>

      {/* Filter and Search Toolbar */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, minWidth: '260px', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved readings by topic or title..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
            <Button variant="outline" size="sm" type="submit">
              Search
            </Button>
          </form>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setFavoriteOnly(!favoriteOnly)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: favoriteOnly ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                background: favoriteOnly ? 'rgba(200, 157, 60, 0.15)' : 'transparent',
                color: favoriteOnly ? 'var(--gold-primary)' : 'var(--text-secondary)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Star size={14} fill={favoriteOnly ? 'currentColor' : 'none'} /> Starred Only
            </button>

            <button
              onClick={() => setShowArchived(!showArchived)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: showArchived ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                background: showArchived ? 'rgba(200, 157, 60, 0.15)' : 'transparent',
                color: showArchived ? 'var(--gold-primary)' : 'var(--text-secondary)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Archive size={14} /> {showArchived ? 'Archived View' : 'Active View'}
            </button>
          </div>
        </div>

        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={12} /> Tags:
            </span>
            <button
              onClick={() => setActiveTag('')}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                border: 'none',
                background: !activeTag ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: !activeTag ? '#07090E' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTag === tag ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: activeTag === tag ? '#07090E' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Grid of Saved Readings */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--accent-gold)' }} />
          <div>Loading saved consultations...</div>
        </div>
      ) : items.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Bookmark size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#FFF' }}>No Saved Consultations Found</h3>
          <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {search || favoriteOnly || activeTag
              ? 'No consultations match your search or active filters.'
              : 'Save any important reading during an AI Consultation to review it here later.'}
          </p>
          <Link to="/chat" className="btn btn-gold">
            Start a Reading
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {items.map((item) => (
            <SavedConsultationCard
              key={item.id}
              item={item}
              onToggleFavorite={handleToggleFavorite}
              onToggleArchive={handleToggleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
