import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastNotificationProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: (id: string) => void;
  duration?: number; // Duration in milliseconds
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    // Update progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100)); // Divide duration by 100ms interval
        return newProgress > 0 ? newProgress : 0;
      });
    }, 100); // Update every 100ms

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [id, duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          progressBg: 'bg-emerald-500',
        };
      case 'error':
        return {
          icon: XCircle,
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          progressBg: 'bg-red-500',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          progressBg: 'bg-orange-500',
        };
      case 'info':
      default:
        return {
          icon: Info,
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          progressBg: 'bg-blue-500',
        };
    }
  };

  const { icon: Icon, bg, text, border, progressBg } = getStyles();

  return (
    <div
      className={`relative w-80 min-h-[70px] p-4 rounded-xl shadow-lg border ${bg} ${border} animate-in fade-in slide-in-from-right-8 duration-300 transform-gpu overflow-hidden`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={`${text} shrink-0`} />
        <p className={`flex-1 text-sm font-medium ${text}`}>{message}</p>
        <button
          onClick={() => onClose(id)}
          className={`p-1 -mr-2 rounded-full ${text} hover:bg-black/5 transition-colors`}
          aria-label="Fechar notificação"
        >
          <X size={16} />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full bg-black/10">
        <div
          className={`h-full ${progressBg} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
