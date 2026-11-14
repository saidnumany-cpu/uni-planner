import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from '../icons/SVGIcons';

// Açık modal yığını: ESC ve odak tuzağı yalnızca en üstteki modalda çalışır
const stack = [];
let savedOverflow = '';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Erişilebilir modal: mobilde alt sayfa (bottom sheet), geniş ekranda ortalanmış diyalog.
 * - ESC ile kapanır, odak modal içinde kalır, kapanınca odak geri döner
 * - İç içe modallarda sadece en üstteki tepki verir
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size,
  role = 'dialog',
  initialFocusRef,
  hideClose = false
}) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const token = {};
    stack.push(token);
    if (stack.length === 1) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // iOS'taki native sekme çubuğu bunu izleyip modal açıkken gizlenir
      document.documentElement.setAttribute('data-modal-open', '');
    }
    const previouslyFocused = document.activeElement;

    const focusFirst = () => {
      if (!ref.current) return;
      const target = initialFocusRef?.current || ref.current.querySelector('[data-autofocus]') || ref.current.querySelector(FOCUSABLE);
      target?.focus({ preventScroll: true });
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (e) => {
      if (stack[stack.length - 1] !== token) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key === 'Tab' && ref.current) {
        const items = [...ref.current.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!ref.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      const i = stack.indexOf(token);
      if (i !== -1) stack.splice(i, 1);
      if (stack.length === 0) {
        document.body.style.overflow = savedOverflow;
        document.documentElement.removeAttribute('data-modal-open');
      }
      if (previouslyFocused && typeof previouslyFocused.focus === 'function' && document.contains(previouslyFocused)) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
    // initialFocusRef sabit bir ref; yalnızca açılış/kapanışta çalışsın
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div
        ref={ref}
        className={`modal${size === 'sm' ? ' modal-sm' : ''}`}
        role={role}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
      >
        {(title || !hideClose) && (
          <div className="modal-header">
            {title ? <h2 id={titleId}>{title}</h2> : <span />}
            {!hideClose && (
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Kapat">
                <XIcon />
              </button>
            )}
          </div>
        )}
        <div className="modal-body">
          {description && <p id={descId} className="muted" style={{ marginBottom: 'var(--s-4)' }}>{description}</p>}
          {children}
        </div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
