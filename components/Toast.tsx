
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-600" />,
    error: <AlertCircle size={20} className="text-rose-600" />,
    info: <Info size={20} className="text-blue-600" />
  };

  return (
    <div className={`fixed bottom-6 right-6 flex items-center p-4 rounded-xl border shadow-lg animate-in slide-in-from-right duration-300 z-50 ${styles[type]}`}>
      <div className="mr-3">{icons[type]}</div>
      <div className="mr-8 font-medium text-sm">{message}</div>
      <button onClick={onClose} className="opacity-60 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
