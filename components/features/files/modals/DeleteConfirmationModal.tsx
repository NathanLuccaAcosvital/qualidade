
import React from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  itemCount: number;
  hasFolder: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  isOpen, onClose, onConfirm, isDeleting, itemCount, hasFolder 
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-red-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 text-red-600 rounded-xl shadow-sm"><Trash2 size={22} /></div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Confirmar Exclusão</h3>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24} /></button>
        </header>
        
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <AlertTriangle size={24} className="text-amber-600 shrink-0 mt-1" />
            <div className="space-y-1">
                <p className="text-xs font-black text-amber-900 uppercase tracking-tight">Ação Irreversível</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                    Você está prestes a remover <b>{itemCount} item(s)</b> permanentemente. 
                    {hasFolder && " Ao excluir uma pasta, todos os arquivos e subpastas dentro dela também serão removidos."}
                </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 font-medium text-center px-4">
              Deseja realmente prosseguir com a limpeza destes recursos do servidor Vital?
          </p>
          
          <div className="pt-4 flex flex-col gap-3">
            <button 
                onClick={onConfirm} 
                disabled={isDeleting} 
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center justify-center gap-3"
            >
              {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <><Trash2 size={18} /> Confirmar e Excluir</>}
            </button>
            <button 
                type="button" 
                onClick={onClose} 
                disabled={isDeleting}
                className="w-full py-4 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition-colors"
            >
                {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
