import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, ChevronRight } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { Button } from '../../components/common/Button';
import { Analytics } from '../../utils/analytics';

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  readTimeMinutes: number;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
}

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    fetch(`/api/v1/articles/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error('Article not found');
        return r.json();
      })
      .then((res) => {
        if (res.data?.article) {
          setArticle(res.data.article);
          Analytics.page(`/blog/${slug}`, res.data.article.title);
        } else {
          setError('Article not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading article...
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h1 style={{ color: '#FFF', fontSize: '1.5rem', marginBottom: '16px' }}>Article Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>The requested article does not exist or has been moved.</p>
        <Link to="/blog">
          <Button variant="gold">
            <ArrowLeft size={16} /> Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://astrologer.app/blog/${article.slug}`,
    },
  };

  return (
    <article className="container" style={{ padding: '40px 16px', maxWidth: '800px' }}>
      <SEOHead
        title={article.seoTitle || article.title}
        description={article.seoDescription || article.excerpt}
        canonical={article.canonicalUrl || `https://astrologer.app/blog/${article.slug}`}
        ogType="article"
        jsonLd={jsonLd}
      />

      {/* Breadcrumb Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/blog" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Blog</Link>
        <span>/</span>
        <span style={{ color: 'var(--accent-gold)' }}>{article.category}</span>
      </nav>

      {/* Article Header */}
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFF', margin: '0 0 16px 0', lineHeight: 1.3 }}>
          {article.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={14} /> {article.author}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={14} /> {article.readTimeMinutes} min read
          </span>
          {article.publishedAt && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={14} /> {new Date(article.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </header>

      {/* Excerpt Callout */}
      <div style={{ padding: '16px 20px', borderRadius: '10px', background: 'rgba(245, 208, 97, 0.08)', borderLeft: '4px solid var(--accent-gold)', marginBottom: '32px', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {article.excerpt}
      </div>

      {/* Article Content */}
      <div
        className="card"
        style={{ padding: '32px', lineHeight: 1.8, fontSize: '1rem', color: '#E2E8F0', whiteSpace: 'pre-wrap', marginBottom: '40px' }}
      >
        {article.content}
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tags:</span>
          {article.tags.map((tag) => (
            <span key={tag} style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.06)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Relevant Tool CTA */}
      <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(13, 17, 24, 0.9)', borderRadius: '16px', border: '1px solid var(--border-gold)', marginBottom: '32px' }}>
        <h3 style={{ color: '#FFF', fontSize: '1.3rem', marginBottom: '8px' }}>Apply this insight to your Vedic birth chart</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Calculate your exact planetary positions and divisional charts in seconds.
        </p>
        <Link to="/kundli-online">
          <Button variant="gold">
            Calculate My Kundli <ChevronRight size={16} />
          </Button>
        </Link>
      </div>

      <div>
        <Link to="/blog" style={{ textDecoration: 'none' }}>
          <Button variant="outline" size="sm">
            <ArrowLeft size={14} /> Back to all articles
          </Button>
        </Link>
      </div>
    </article>
  );
};
