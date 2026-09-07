import React, { useState } from 'react';
import useHomework from '../hooks/useHomework';
import HomeworkModal from './HomeworkModal';
import ConfirmDialog from './ConfirmDialog';
import { getDueDateStatus } from '../utils/helpers';
import { TrashIcon, ClipboardIcon, PlusIcon } from '../icons/SVGIcons';

/**
 * Ders ödevleri listesi
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} courseId - Ders ID'si
 */
export default function HomeworkList({ userId, courseId }) {
  const { homework, loading, addHomework, updateHomework, deleteHomework, toggleComplete } = useHomework(userId, courseId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  
  // State for confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, homeworkId: null, title: '' });

  const activeHomework = homework.filter(h => !h.isCompleted);
  const completedHomework = homework.filter(h => h.isCompleted);

  const handleOpenModal = (hw = null) => {
    setEditingHomework(hw);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingHomework(null);
    setIsModalOpen(false);
  };

  const handleSave = async (data) => {
    if (editingHomework) {
      await updateHomework(editingHomework.id, data);
    } else {
      await addHomework(data);
    }
    handleCloseModal();
  };

  const getUrgencyBadge = (dateString) => {
    const status = getDueDateStatus(dateString);
    if (!status) return null;

    if (status.isOverdue) {
      return <span className="badge badge-danger">Süresi Geçti</span>;
    } else if (status.isUrgent) {
      return <span className="badge badge-warning">Yaklaşıyor</span>;
    } else {
      return <span className="badge badge-success">{status.due.toLocaleDateString('tr-TR')}</span>;
    }
  };

  const handleDeleteClick = (e, hw) => {
    e.stopPropagation();
    setConfirmDialog({ isOpen: true, homeworkId: hw.id, title: hw.title });
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.homeworkId) {
      deleteHomework(confirmDialog.homeworkId);
    }
    setConfirmDialog({ isOpen: false, homeworkId: null, title: '' });
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, homeworkId: null, title: '' });
  };

  if (loading) return <div className="text-center text-secondary p-4">Yükleniyor...</div>;

  return (
    <div className="homework-list flex-col gap-md">
      <div className="flex justify-end">
        <button 
          className="glass-button-primary flex items-center gap-xs" 
          onClick={() => handleOpenModal()}
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <PlusIcon size={18} /> Yeni Ödev
        </button>
      </div>

      {homework.length === 0 ? (
        <div className="empty-state">
          <div className="mb-4 flex-center text-secondary">
            <ClipboardIcon size={48} />
          </div>
          <h3>Henüz ödev yok</h3>
          <p className="text-secondary">Bu ders için ödev eklenmemiş.</p>
        </div>
      ) : (
        <>
          {activeHomework.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm text-secondary mb-2 uppercase tracking-wider">Aktif Ödevler</h3>
              {activeHomework.map(hw => (
                <div key={hw.id} className="homework-item glass flex gap-sm items-start mb-2 rounded-lg">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      id={`hw-check-${hw.id}`}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      checked={hw.isCompleted}
                      onChange={() => toggleComplete(hw.id, hw.isCompleted)}
                      aria-label={`${hw.title} ödevini tamamla`}
                    />
                  </div>
                  <div className="flex-1 cursor-pointer" onClick={() => handleOpenModal(hw)}>
                    <div className="flex-between mb-1">
                      <label htmlFor={`hw-check-${hw.id}`} className="homework-title font-semibold cursor-pointer">{hw.title}</label>
                      {getUrgencyBadge(hw.dueDate)}
                    </div>
                    {hw.description && (
                      <p className="text-sm text-tertiary line-clamp-2">{hw.description}</p>
                    )}
                  </div>
                  <button 
                    className="glass-button-icon text-red-400 hover:text-red-300 ml-2 pt-1" 
                    onClick={(e) => handleDeleteClick(e, hw)}
                    aria-label={`${hw.title} ödevini sil`}
                    style={{ minHeight: '44px', minWidth: '44px' }}
                  >
                    <TrashIcon size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {completedHomework.length > 0 && (
            <div>
              <h3 className="text-sm text-secondary mb-2 uppercase tracking-wider">Tamamlanan Ödevler</h3>
              {completedHomework.map(hw => (
                <div key={hw.id} className="homework-item completed glass flex gap-sm items-start mb-2 rounded-lg">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      id={`hw-check-completed-${hw.id}`}
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      checked={hw.isCompleted}
                      onChange={() => toggleComplete(hw.id, hw.isCompleted)}
                      aria-label={`${hw.title} ödevini geri al`}
                    />
                  </div>
                  <div className="flex-1 cursor-pointer" onClick={() => handleOpenModal(hw)}>
                    <div className="flex-between mb-1">
                      <label htmlFor={`hw-check-completed-${hw.id}`} className="homework-title font-semibold text-secondary cursor-pointer">{hw.title}</label>
                    </div>
                  </div>
                  <button 
                    className="glass-button-icon text-red-400 hover:text-red-300 ml-2 pt-1" 
                    onClick={(e) => handleDeleteClick(e, hw)}
                    aria-label={`${hw.title} ödevini sil`}
                    style={{ minHeight: '44px', minWidth: '44px' }}
                  >
                    <TrashIcon size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <HomeworkModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          onSave={handleSave} 
          homework={editingHomework} 
        />
      )}

      {confirmDialog.isOpen && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Ödevi Sil"
          message={`"${confirmDialog.title}" ödevini silmek istediğinizden emin misiniz?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          confirmText="Sil"
          cancelText="İptal"
          isDestructive={true}
        />
      )}
    </div>
  );
}
