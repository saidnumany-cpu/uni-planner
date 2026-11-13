import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleIcon, GraduationCapIcon, CalendarIcon, BookOpenIcon, ClipboardIcon, CheckCircleIcon, AlertCircleIcon } from '../icons/SVGIcons';

const getErrorMessage = (err) => {
  const code = err?.code || '';
  switch (code) {
    case 'auth/unauthorized-domain':
      return { title: 'Bu alan adı yetkilendirilmemiş.', detail: `Firebase Console → Authentication → Settings → Authorized domains listesine "${window.location.hostname}" eklenmeli.` };
    case 'auth/popup-blocked':
      return { title: 'Giriş penceresi engellendi.', detail: 'Tarayıcında açılır pencerelere izin ver ya da aşağıdaki yönlendirmeli girişi kullan.' };
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return { title: 'Giriş tamamlanmadı.', detail: 'Pencere kapatıldı. Tekrar deneyebilir ya da yönlendirmeli girişi kullanabilirsin.' };
    case 'auth/network-request-failed':
      return { title: 'İnternet bağlantısı yok gibi görünüyor.', detail: 'Bağlantını kontrol edip tekrar dene.' };
    default:
      return { title: 'Giriş yapılamadı.', detail: err?.message || 'Lütfen tekrar dene.' };
  }
};

const FEATURES = [
  { icon: CalendarIcon, text: 'Haftalık ders programı, bugünkü dersler' },
  { icon: BookOpenIcon, text: 'Her ders için haftalık notlar' },
  { icon: ClipboardIcon, text: 'Teslim tarihli ödev takibi' },
  { icon: CheckCircleIcon, text: 'Yoklama ve devamsızlık hakkı uyarısı' }
];

/** Giriş ekranı */
export default function LoginScreen() {
  const { signInWithGoogle, signInWithGoogleRedirect, authError, clearAuthError } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRedirect, setShowRedirect] = useState(false);

  useEffect(() => {
    if (!authError) return;
    setError(getErrorMessage(authError));
    clearAuthError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authError]);

  const run = async (fn) => {
    setError(null);
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      console.error('Giriş hatası:', err);
      setError(getErrorMessage(err));
      if (['auth/popup-blocked', 'auth/cancelled-popup-request', 'auth/popup-closed-by-user'].includes(err?.code)) {
        setShowRedirect(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <div className="login-card page-enter">
        <div className="stack" style={{ gap: 'var(--s-4)' }}>
          <span className="login-mark" aria-hidden="true"><GraduationCapIcon size={30} /></span>
          <div>
            <h1 className="login-title">UniPlanner</h1>
            <p className="muted" style={{ marginTop: 'var(--s-2)', fontSize: '1.0625rem' }}>
              Dersin, notun, ödevin ve yoklaman tek yerde.
            </p>
          </div>
        </div>

        <ul className="feature-list">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text}><span className="fi" aria-hidden="true"><Icon size={18} /></span>{text}</li>
          ))}
        </ul>

        <div className="stack-sm">
          {error && (
            <div className="alert alert-danger" role="alert">
              <AlertCircleIcon size={18} />
              <span><strong>{error.title}</strong>{error.detail}</span>
            </div>
          )}

          <button
            type="button"
            className="btn btn-block"
            style={{ minHeight: 52, fontSize: '1rem' }}
            onClick={() => run(signInWithGoogle)}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <span className="spinner spinner-sm" aria-hidden="true" /> : <GoogleIcon size={20} />}
            {loading ? 'Giriş yapılıyor…' : 'Google ile devam et'}
          </button>

          {showRedirect && (
            <button type="button" className="btn btn-ghost btn-block" onClick={() => run(signInWithGoogleRedirect)} disabled={loading}>
              Yönlendirme ile giriş yap
            </button>
          )}

          <p className="subtle text-xs" style={{ textAlign: 'center', marginTop: 'var(--s-2)' }}>
            Verilerin yalnızca senin hesabında saklanır.
          </p>
        </div>
      </div>
    </main>
  );
}
