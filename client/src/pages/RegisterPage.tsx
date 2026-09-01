import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError('Password must contain at least one letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password });
      navigate('/profile', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '460px', paddingTop: '50px' }}>
      <Card glow>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            border: '1px solid var(--border-gold)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)',
            marginBottom: '12px',
          }}>
            <Sparkles size={22} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Start with astronomical precision Vedic astrology
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '0.85rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} flex-shrink="0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="input-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="input-field"
              placeholder="Aryabhata Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="Minimum 8 chars (letters + numbers)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="input-field"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', margin: '4px 0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: password.length >= 8 ? '#34D399' : 'var(--text-muted)' }}>
              <CheckCircle2 size={13} /> At least 8 characters
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: /^(?=.*[A-Za-z])(?=.*\d)/.test(password) ? '#34D399' : 'var(--text-muted)' }}>
              <CheckCircle2 size={13} /> Contains both letters and numbers
            </span>
          </div>

          <Button type="submit" variant="gold" style={{ width: '100%', marginTop: '6px' }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Create Free Account <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 500 }}>
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
