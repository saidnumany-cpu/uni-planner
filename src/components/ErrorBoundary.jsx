import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UniPlanner ErrorBoundary yakaladı:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = 'schedule';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="flex-center animate-fade-in" 
          style={{ 
            minHeight: '100dvh', 
            padding: 'var(--space-md)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
          }}
        >
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
          
          <div 
            className="glass glass-card animate-slide-up" 
            style={{ 
              width: '100%', 
              maxWidth: '460px', 
              textAlign: 'center',
              padding: 'var(--space-xl)'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-md)' }}>
              ⚠️
            </div>
            <h2 style={{ marginBottom: 'var(--space-sm)' }}>
              Beklenmeyen Bir Hata Oluştu
            </h2>
            <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-lg)' }}>
              Uygulama çalışırken beklenmeyen bir durum ile karşılaşıldı. Verileriniz güvendedir.
            </p>

            {this.state.error?.message && (
              <div 
                className="glass-surface text-xs" 
                style={{ 
                  padding: 'var(--space-sm)', 
                  marginBottom: 'var(--space-lg)',
                  color: 'var(--accent-red)',
                  textAlign: 'left',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace'
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <button 
              className="glass-button glass-button-primary" 
              onClick={this.handleReset}
              style={{ width: '100%', minHeight: '44px' }}
            >
              Uygulamayı Yeniden Başlat
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
