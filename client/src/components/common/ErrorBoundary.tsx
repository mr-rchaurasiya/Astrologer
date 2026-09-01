import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React ErrorBoundary exception:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-primary, #07090E)' }}>
          <Card style={{ maxWidth: '520px', width: '100%', padding: '36px', textAlign: 'center', background: 'rgba(18, 24, 38, 0.95)', border: '1px solid var(--border-gold)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <AlertTriangle size={28} color="#F87171" />
            </div>

            <h2 style={{ margin: '0 0 10px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Cosmic Alignment Interrupted
            </h2>

            <p style={{ margin: '0 0 24px', fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              An unexpected interface error occurred. The astronomical calculation engine and your data remain safe and uncompromised.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Button variant="gold" onClick={this.handleReset} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={16} />
                <span>Reload Application</span>
              </Button>

              <Button variant="outline" onClick={() => (window.location.href = '/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Home size={16} />
                <span>Return to Dashboard</span>
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
