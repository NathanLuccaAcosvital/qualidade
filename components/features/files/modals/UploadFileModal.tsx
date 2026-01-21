import React, { useState, useCallback, useRef } from 'react';
import { X, UploadCloud, FileText, Loader2, AlertCircle, Files, Trash2, MousePointer2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  isUploading: boolean;
  currentFolderId: string | null;
  initialFiles?: File[];
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({ 
  isOpen, onClose, onUpload, isUploading, initialFiles = [] 
}) => {
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza arquivos se vierem do drag-and-drop global
  React.useEffect(() => {
    if (initialFiles.length > 0) {
      setSelectedFiles(initialFiles);
    }
  }, [initialFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      setError(null);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      setError(null);
    }
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError(t('files.upload.noFileSelected'));
      return;
    }
    await onUpload(selectedFiles);
    setSelectedFiles([]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm"><UploadCloud size={22} /></div>
            <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Upload em Lote</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo de Importação Massiva</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24} /></button>
        </header>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
          {/* Zona de Drop */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
              ${isDragging ? 'border-blue-500 bg-blue-50 scale-[0.98]' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'}
            `}
          >
            <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            
            <div className={`mb-4 p-4 rounded-2xl transition-all ${isDragging ? 'bg-blue-600 text-white animate-bounce' : 'bg-slate-100 text-slate-400'}`}>
                <Files size={32} />
            </div>
            
            <div className="text-center">
                <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                    {isDragging ? "Solte para Processar" : "Arraste do PC ou Clique aqui"}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Formatos aceitos: PDF, JPG, PNG</p>
            </div>

            {isDragging && (
                <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[1px] flex items-center justify-center">
                    <MousePointer2 size={40} className="text-blue-600 animate-pulse" />
                </div>
            )}
          </div>

          {/* Lista de Arquivos Selecionados */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Arquivos na Fila ({selectedFiles.length})</h4>
                 <button onClick={() => setSelectedFiles([])} className="text-[9px] font-black text-red-500 uppercase hover:underline">Limpar Fila</button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl group/item">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={16} className="text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-[11px] font-bold rounded-2xl border border-red-100 flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </div>
          )}
        </div>

        <footer className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isUploading}
            className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isUploading || selectedFiles.length === 0} 
            className="px-10 py-3 bg-[#081437] text-white rounded-xl font-bold text-xs uppercase tracking-[2px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50 flex items-center gap-3"
          >
            {isUploading ? <Loader2 size={18} className="animate-spin text-blue-400" /> : <UploadCloud size={18} />}
            Efetivar Upload
          </button>
        </footer>
      </div>
    </div>
  );
};