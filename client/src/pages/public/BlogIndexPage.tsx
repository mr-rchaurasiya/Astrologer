import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight, Search } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { Analytics } from '../../utils/analytics';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTimeMinutes: number;
  publishedAt?: string;
  author: string;
}

export const BlogIndexPage: React.FC = () => {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Analytics.page('/blog', 'Vedic Astrology Articles & Educational Knowledge Base');

    // Fetch categories and articles
    Promise.all([
      fetch('/api/v1/articles/categories').then((r) => (r.ok ? r.json() : { data: { categories: [] } })),
      fetch('/api/v1/articles?limit=20').then((r) => (r.ok ? r.json() : { data: { articles: [] } })),
    ])
      .then(([catRes, artRes]) => {
        if (catRes.data?.categories) setCategories(catRes.data.categories);
        if (artRes.data?.articles) setArticles(artRes.data.articles);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = (catId: string) => {
    setSelectedCategory(catId === selectedCategory ? '' : catId);
    setLoading(true);
    const queryUrl = catId && catId !== selectedCategory
      ? `/api/v1/articles?category=${encodeURIComponent(catId)}`
      : '/api/v1/articles';

    fetch(queryUrl)
      .then((r) => (r.ok ? r.json() : { data: { articles: [] } }))
      .then((res) => {
        if (res.data?.articles) setArticles(res.data.articles);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const filteredArticles = articles.filter((art) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return art.title.toLowerCase().includes(q) || art.excerpt.toLowerCase().includes(q);
  });

  return (
    <div className="container" style={{ padding: '40px 16px', maxWidth: '1000px' }}>
      <SEOHead
        title="Vedic Astrology Knowledge Base & Educational Articles"
        description="Explore authoritative guides on Vedic Kundli charts, Vimshottari Dashas, Planetary Yogas, Gochar Transits, and responsible AI astrology."
        canonical="https://astrologer.app/blog"
      />

      <header style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(245, 208, 97, 0.1)', border: '1px solid var(--border-gold)', color: 'var(--accent-gold)', fontSize: '0.85rem', marginBottom: '16px' }}>
          <BookOpen size={14} /> Vedic Astrology Education
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFF', margin: '0 0 12px 0' }}>
          Astrology <span style={{ color: 'var(--gold-primary)' }}>Knowledge Hub</span>
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          Classical Jyotish principles, planetary timing, and guides written by our astrology editorial team.
        </p>

        {/* Search Input */}
        <div style={{ maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ width: '100%', paddingLeft: '38px', borderRadius: '24px' }}
          />
        </div>
      </header>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
        <button
          onClick={() => handleFilter('')}
          className={`btn ${selectedCategory === '' ? 'btn-gold' : 'btn-outline'}`}
          style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '20px' }}
        >
          All Topics
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleFilter(cat.id)}
            className={`btn ${selectedCategory === cat.id ? 'btn-gold' : 'btn-outline'}`}
            style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '20px' }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading articles...</div>
      ) : filteredArticles.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {searchQuery ? 'No articles match your search criteria.' : 'Articles are currently being prepared by our editorial team.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredArticles.map((art) => (
            <Link key={art.id || art.slug} to={`/blog/${art.slug}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s', border: '1px solid var(--border-gold)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {art.category.replace('-', ' ')}
                  </span>
                  <h2 style={{ color: '#FFF', fontSize: '1.15rem', marginTop: '8px', marginBottom: '10px', lineHeight: 1.4 }}>
                    {art.title}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '16px' }}>
                    {art.excerpt}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {art.readTimeMinutes} min read
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                    Read Guide <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
