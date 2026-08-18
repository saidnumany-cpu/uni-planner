import React, { useState } from 'react';
import useHomework from '../hooks/useHomework';
import HomeworkModal from './HomeworkModal';
import { getDueDateStatus } from '../utils/helpers';

/**
 * Ders ödevleri listesi
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} courseId - Ders ID'si
 */
export default function HomeworkList({ userId, courseId }) {
  const { homework, loading, addHomework, updateHomework, deleteHomework, toggleComplete } = useHomework(userId, courseId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);

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

  if (loading) return <div className="text-center text-secondary p-4">Yükleniyor...</div>;

  return (
    <div className="homework-list flex-col gap-md">
      <div className="flex justify-end">
        <button className="glass-button-primary" onClick={() => handleOpenModal()}>
          + Yeni Ödev
        </button>
      </div>

      {homework.length === 0 ? (
        <div className="empty-state">
          <div className="text-4xl mb-4">📋</div>
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
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      checked={hw.isCompleted}
                      onChange={() => toggleComplete(hw.id, hw.isCompleted)}
                    />
                  </div>
                  <div className="flex-1 cursor-pointer" onClick={() => handleOpenModal(hw)}>
                    <div className="flex-between mb-1">
                      <span className="homework-title font-semibold">{hw.title}</span>
                      {getUrgencyBadge(hw.dueDate)}
                    </div>
                    {hw.description && (
                      <p className="text-sm text-tertiary line-clamp-2">{hw.description}</p>
                    )}
                  </div>
                  <button 
                    className="glass-button-icon text-red-400 hover:text-red-300 ml-2 pt-1" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Bu ödevi silmek istediğinizden emin misiniz?')) {
                        deleteHomework(hw.id);
                      }
                    }}
                    aria-label={`${hw.title} ödevini sil`}
                  >
                    🗑️
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
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      checked={hw.isCompleted}
                      onChange={() => toggleComplete(hw.id, hw.isCompleted)}
                    />
                  </div>
                  <div className="flex-1 cursor-pointer" onClick={() => handleOpenModal(hw)}>
                    <div className="flex-between mb-1">
                      <span className="homework-title font-semibold text-secondary">{hw.title}</span>
                    </div>
                  </div>
                  <button 
                    className="glass-button-icon text-red-400 hover:text-red-300 ml-2 pt-1" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Bu ödevi silmek istediğinizden emin misiniz?')) {
                        deleteHomework(hw.id);
                      }
                    }}
                    aria-label={`${hw.title} ödevini sil`}
                  >
                    🗑️
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
    </div>
  );
}
