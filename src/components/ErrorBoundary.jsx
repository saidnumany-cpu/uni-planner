import React from 'react';

/** Beklenmeyen hatalarda uygulamanın tamamen beyaz ekrana düşmesini engeller */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UniPlanner hata yakaladı:', error, info);
  }

  handleReset = () => {
    window.location.hash = 'schedule';
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="login">
        <div className="login-card card" role="alert" style={{ textAlign: 'center', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem' }}>Bir şeyler ters gitti</h1>
          <p className="muted">Beklenmeyen bir hata oluştu. Verilerin güvende; uygulamayı yeniden başlatmayı dene.</p>
          {this.state.error?.message && (
            <code className="text-xs subtle" style={{ wordBreak: 'break-word' }}>{this.state.error.message}</code>
          )}
          <button type="button" className="btn btn-primary btn-block" onClick={this.handleReset}>Yeniden başlat</button>
        </div>
      </main>
    );
  }
}
