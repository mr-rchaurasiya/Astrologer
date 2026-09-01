import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, Edit, Trash2, ArrowLeft, Save } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { Button } from '../../components/common/Button';

interface ArticleItem {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  author: string;
  seoTitle?: string;
  seoDescription?: string;
}

export const AdminArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ArticleItem>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'kundli',
    tags: [],
    status: 'draft',
    author: 'Vedic Astrologer Editorial Team',
    seoTitle: '',
    seoDescription: '',
  });
  const [tagsInput, setTagsInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchArticles = () => {
    setLoading(true);
    fetch('/api/v1/articles/admin/list?limit=50', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.data?.articles) {
          setArticles(res.data.articles);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'kundli',
      tags: [],
      status: 'published',
      author: 'Vedic Astrologer Editorial Team',
      seoTitle: '',
      seoDescription: '',
    });
    setTagsInput('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (art: ArticleItem) => {
    setEditId(art.id || art._id || null);
    setFormData({
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      content: art.content,
      category: art.category,
      tags: art.tags,
      status: art.status,
      author: art.author,
      seoTitle: art.seoTitle,
      seoDescription: art.seoDescription,
    });
    setTagsInput(art.tags ? art.tags.join(', ') : '');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      ...formData,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    };

    const url = editId ? `/api/v1/articles/admin/${editId}` : '/api/v1/articles/admin/create';
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save article');
      }

      setSuccessMsg(editId ? 'Article updated successfully' : 'Article created successfully');
      setIsEditing(false);
      fetchArticles();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const res = await fetch(`/api/v1/articles/admin/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch {
      // Graceful error handling
    }
  };

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1000px' }}>
      <SEOHead title="Admin Blog & SEO Articles" noindex={true} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '1.8rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen color="var(--accent-gold)" /> Content & SEO Articles Manager
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Author, publish, and optimize educational Vedic astrology articles
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/admin/growth">
            <Button variant="outline" size="sm">
              <ArrowLeft size={14} /> Growth Dashboard
            </Button>
          </Link>
          {!isEditing && (
            <Button variant="gold" size="sm" onClick={handleOpenCreate}>
              <Plus size={14} /> New Article
            </Button>
          )}
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34D399', marginBottom: '20px', fontSize: '0.875rem' }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#F87171', marginBottom: '20px', fontSize: '0.875rem' }}>
          {errorMsg}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ color: '#FFF', fontSize: '1.25rem', margin: 0 }}>
            {editId ? 'Edit Article' : 'Create New Article'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Slug (optional, auto-generated)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="input"
                style={{ width: '100%' }}
                placeholder="e.g. understanding-vimshottari-dasha"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="kundli">Kundli & Birth Charts</option>
                <option value="vedic-astrology">Vedic Astrology Fundamentals</option>
                <option value="dashas">Vimshottari Dashas</option>
                <option value="yogas">Auspicious & Inauspicious Yogas</option>
                <option value="transits">Planetary Transits (Gochar)</option>
                <option value="compatibility">Kundli Matching & Synastry</option>
                <option value="ai-astrology">Responsible AI Astrology</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Tags (comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="input"
                style={{ width: '100%' }}
                placeholder="e.g. dasha, timing, planets"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Excerpt (Meta preview) *</label>
            <textarea
              required
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="input"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Article Content *</label>
            <textarea
              required
              rows={10}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input"
              style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="gold" type="submit">
              <Save size={16} /> Save Article
            </Button>
          </div>
        </form>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Title</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading articles...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No articles found. Click "New Article" to create your first guide.
                  </td>
                </tr>
              ) : (
                articles.map((art) => (
                  <tr key={art.id || art._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px', color: '#FFF', fontWeight: 500 }}>
                      <Link to={`/blog/${art.slug}`} target="_blank" style={{ color: '#FFF', textDecoration: 'none' }}>
                        {art.title}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {art.category}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          background: art.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 208, 97, 0.15)',
                          color: art.status === 'published' ? '#34D399' : 'var(--accent-gold)',
                        }}
                      >
                        {art.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEdit(art)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', marginRight: '12px' }}
                        title="Edit Article"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id || art._id || '')}
                        style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer' }}
                        title="Delete Article"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
