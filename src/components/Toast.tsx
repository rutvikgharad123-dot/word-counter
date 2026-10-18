import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  type?: 'success' | 'info' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, type = 'success' }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2400);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-inverse-surface text-inverse-on-surface font-body-sm text-body-sm shadow-xl flex items-center gap-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
    >
      <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">
        {type === 'error' ? 'error' : 'check_circle'}
      </span>
      <span>{message}</span>
    </div>
  );
};
