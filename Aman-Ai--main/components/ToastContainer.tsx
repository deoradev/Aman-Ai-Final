import React from 'react';
import { Toast, ToastType } from '../hooks/useToast';

const ToastComponent: React.FC<Omit<Toast, 'id'>> = ({ message, type }) => {
    const getIcon = () => {
        switch(type) {
            case 'success': return <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
            case 'warning': return <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
            case 'error': return <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
            default: return <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
        }
    };
    const colors = {
        info: 'bg-secondary-500 text-white',
        success: 'bg-accent-500 text-white',
        warning: 'bg-primary-500 text-white',
        error: 'bg-warning-500 text-white',
    };

    return (
        <div className={`flex items-center gap-3 p-4 rounded-xl shadow-soft-lg w-full animate-fade-in-up ${colors[type]}`} role="status">
            <div className="flex-shrink-0">{getIcon()}</div>
            <p className="text-sm font-semibold">{message}</p>
        </div>
    );
};

export const ToastContainer: React.FC<{ toasts: Toast[] }> = ({ toasts }) => {
  return (
    <div className="fixed bottom-24 right-6 z-[200] space-y-3 w-full max-w-sm">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} message={toast.message} type={toast.type} />
      ))}
    </div>
  );
};
