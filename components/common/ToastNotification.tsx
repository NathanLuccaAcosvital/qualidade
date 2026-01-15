
import React, { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastNotificationProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

/**
 * Configuração de estilos baseada no tipo (O) Aberto para novos tipos.
 */
const TOAST_VARIANTS: Record<ToastType, any> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    progress: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    progress: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    progress: 'bg-orange-500',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    progress: 'bg-[var(--color-detail-blue)]', // Usar a variável para o progresso do info
  },
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  const [progress, setProgress] = useState(100);
  const styles = useMemo(() => TOAST_VARIANTS[type] || TOAST_VARIANTS.info, [type]);
  const Icon = styles.icon;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        onClose(id);
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [id, duration, onClose]);

  return (
    <div
      className={`relative w-80 min-h-[70px] p-4 rounded-xl shadow-lg border ${styles.bg} ${styles.border} animate-in fade-in slide-in-from-right-8 duration-300 transform-gpu overflow-hidden`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={`${styles.text} shrink-0`} />
        <p className={`flex-1 text-sm font-medium ${styles.text}`}>{message}</p>
        <button
          onClick={() => onClose(id)}
          className={`p-1 -mr-2 rounded-full ${styles.text} hover:bg-black/5 transition-colors`}
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Barra de Progresso - (S) Elemento visual isolado */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5">
        <div
          className={`h-full ${styles.progress} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
