import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleIcon } from '../icons/SVGIcons';

/**
 * Kullanıcı giriş ekranı
 */
const LoginScreen = () => {
  const { signInWithGoogle, signInWithGoogleRedirect } = useAuth();
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRedirectOption, setShowRedirectOption] = useState(false);

  const getErrorMessage = (err) => {
    const code = err?.code || '';
    if (code === 'auth/unauthorized-domain') {
      return {
        title: 'Bu alan adı (domain) yetkilendirilmemiş.',
        detail: 'Firebase Console > Authentication > Settings > Authorized domains bölümüne "uni-planner-xi.vercel.app" eklenmelidir.'
      };
    }
    if (code === 'auth/popup-blocked') {
      return {
        title: 'Açılır pencere (popup) tarayıcınız tarafından engellendi.',
        detail: 'Lütfen tarayıcınızdan açılır pencerelere izin verin veya aşağıdaki "Yönlendirme ile Giriş Yap" seçeneğini kullanın.'
      };
    }
    if (code === 'auth/popup-closed-by-user') {
      return {
        title: 'Giriş penceresi tamamlanmadan kapatıldı.',
        detail: 'Lütfen tekrar deneyerek Google hesabınızı seçin.'
      };
    }
    if (code === 'auth/network-request-failed') {
      return {
        title: 'Ağ bağlantısı hatası oluştu.',
        detail: 'Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'
      };
    }
    if (code === 'auth/cancelled-popup-request') {
      return {
        title: 'Giriş işlemi iptal edildi.',
        detail: 'Birden fazla pencere açılmış olabilir. Lütfen tekrar deneyin.'
      };
    }
    return {
      title: 'Giriş yapılırken bir hata oluştu.',
      detail: err?.message || 'Lütfen tekrar deneyin.'
    };
  };

  const handleLogin = async () => {
    try {
      setError('');
      setErrorDetail('');
      setIsLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
      const parsed = getErrorMessage(err);
      setError(parsed.title);
      setErrorDetail(parsed.detail);
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
        setShowRedirectOption(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectLogin = async () => {
    try {
      setError('');
      setErrorDetail('');
      setIsLoading(true);
      await signInWithGoogleRedirect();
    } catch (err) {
      console.error('Redirect login error:', err);
      const parsed = getErrorMessage(err);
      setError(parsed.title);
      setErrorDetail(parsed.detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ minHeight: '100dvh', padding: 'var(--space-md)' }}>
      <div className="glass glass-card animate-slide-up" style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>
          🎓
        </div>
        <h1 style={{ marginBottom: 'var(--space-xs)' }}>UniPlanner</h1>
        <p className="text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>
          Ders Programı & Not Takibi
        </p>

        {error && (
          <div 
            className="glass-surface text-sm" 
            style={{ 
              color: 'var(--accent-red)', 
              padding: 'var(--space-md)', 
              marginBottom: 'var(--space-md)',
              textAlign: 'left',
              borderRadius: 'var(--glass-radius-sm)',
              border: '1px solid rgba(220, 38, 38, 0.3)'
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: errorDetail ? '4px' : 0 }}>{error}</div>
            {errorDetail && (
              <div className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {errorDetail}
              </div>
            )}
          </div>
        )}

        <button 
          className="glass-button glass-button-primary" 
          onClick={handleLogin}
          disabled={isLoading}
          aria-busy={isLoading}
          style={{ width: '100%', padding: 'var(--space-md)', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isLoading ? (
            <div className="spinner" style={{ width: '22px', height: '22px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          ) : (
            <GoogleIcon size={22} />
          )}
          {isLoading ? 'Giriş yapılıyor...' : 'Google ile Giriş Yap'}
        </button>

        {showRedirectOption && (
          <button
            className="glass-button text-xs text-secondary"
            onClick={handleRedirectLogin}
            disabled={isLoading}
            style={{ width: '100%', marginTop: 'var(--space-sm)', minHeight: '36px' }}
          >
            Yönlendirme (Redirect) ile Giriş Yap
          </button>
        )}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;

