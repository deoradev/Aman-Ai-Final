import React from 'react';
import Logo from './Logo';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  text: string;
  confirmText: string;
  cancelText: string;
  variant?: 'primary' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, text, confirmText, cancelText, variant = 'primary' }) => {
  if (!isOpen) return null;

  const confirmButtonColor = variant === 'warning'
    ? 'bg-warning-500 hover:bg-warning-600'
    : 'bg-primary-500 hover:bg-primary-600';
  
  const titleColor = variant === 'warning'
    ? 'text-warning-500'
    : 'text-primary-500';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[150] p-4 pt-16" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="bg-base-50 dark:bg-base-800 rounded-2xl shadow-soft-lg w-full max-w-sm animate-enter">
        <div className="p-6">
          <div className="flex justify-center mb-4"><Logo /></div>
          <h2 id="confirm-dialog-title" className={`text-xl font-bold ${titleColor} mb-4 text-center`}>{title}</h2>
          <p className="text-base-600 dark:text-base-300 mb-6 text-center">{text}</p>
          <div className="flex justify-end gap-4">
            <button onClick={onClose} className="px-4 py-2 bg-base-200 dark:bg-base-600 text-base-800 dark:text-base-200 rounded-lg hover:bg-base-300 dark:hover:bg-base-500 transition-colors">
              {cancelText}
            </button>
            <button onClick={onConfirm} className={`px-4 py-2 text-white font-semibold rounded-lg transition-colors ${confirmButtonColor}`}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes enter { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-enter { animation: enter 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
