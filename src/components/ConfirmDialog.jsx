import { useRef } from 'react';
import Modal from './Modal';
import { AlertTriangleIcon } from '../icons/SVGIcons';

/** Onay diyaloğu (silme gibi geri alınamaz işlemler için) */
export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Sil',
  cancelText = 'Vazgeç',
  variant = 'danger'
}) {
  const cancelRef = useRef(null);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      role="alertdialog"
      initialFocusRef={cancelRef}
      hideClose
      footer={
        <>
          <button ref={cancelRef} type="button" className="btn grow" onClick={onCancel}>{cancelText}</button>
          <button
            type="button"
            className={`btn grow ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </>
      }
    >
      {variant === 'danger' && <div className="confirm-icon"><AlertTriangleIcon size={24} /></div>}
      <h2 style={{ marginBottom: 'var(--s-2)' }}>{title}</h2>
      <p className="muted">{message}</p>
    </Modal>
  );
}
