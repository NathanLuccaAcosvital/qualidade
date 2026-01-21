import React from 'react';
import { CheckSquare, Square, Clock, Eye, Edit2, Trash2, FileText, Folder } from 'lucide-react';
import { FileNode, FileType, UserRole } from '../../../../types/index.ts';
import { FileStatusBadge } from './FileStatusBadge.tsx';

interface FileCardProps {
  file: FileNode;
  isSelected: boolean;
  onNavigate: (id: string | null) => void;
  onPreview: (file: FileNode) => void;
  onToggleSelection: (fileId: string) => void;
  onRename: (file: FileNode) => void;
  onDelete: (fileId: string) => void;
  userRole: UserRole;
}

export const FileCard: React.FC<FileCardProps> = ({ 
  file, isSelected, onNavigate, onPreview, onToggleSelection, onRename, onDelete, userRole 
}) => {
  const isFolder = file.type === FileType.FOLDER;
  const isViewed = !!file.metadata?.viewedAt;
  const isClient = userRole === UserRole.CLIENT;
  const isRootFolder = isFolder && file.parentId === null;

  const handleMainClick = () => {
    if (isFolder) onNavigate(file.id);
    else onPreview(file);
  };

  return (
    <div 
      className={`group relative flex flex-col bg-white border transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer
        ${isSelected 
          ? 'border-blue-600 ring-4 ring-blue-600/5 shadow-lg scale-[1.02]' 
          : 'border-slate-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5'}`}
      onClick={handleMainClick}
    >
      {/* 1. ZONA DE AÇÕES (TOPO) */}
      <div className="flex items-center justify-between p-3 shrink-0">
        <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 bg-slate-50 group-hover:bg-blue-50 transition-colors ${isSelected ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-400'}`}>
                {isFolder ? <Folder size={18} /> : <FileText size={18} />}
            </div>
            {isViewed && !isFolder && (
                <div className="flex items-center text-blue-500 bg-blue-50 p-1.5 rounded-lg border border-blue-100" title="Visto pelo cliente">
                    <Eye size={12} strokeWidth={2.5} />
                </div>
            )}
        </div>

        <div className="flex items-center gap-1">
          {!isClient && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onRename(file); }}
                className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                title="Renomear"
              >
                <Edit2 size={12} />
              </button>
              {!isRootFolder && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
                  className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  title="Apagar"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}
          
          <button 
              className={`p-1.5 rounded-lg transition-all
              ${isSelected ? 'text-blue-600 bg-blue-50' : 'text-slate-300 hover:text-blue-500'}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelection(file.id);
              }}
          >
              {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
          </button>
        </div>
      </div>

      {/* 2. ZONA DE IDENTIFICAÇÃO (CENTRO) */}
      <div className="px-5 py-2 flex-1">
        <h4 className={`text-[13px] font-bold leading-snug uppercase tracking-tight line-clamp-3 transition-colors mb-3
          ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
          {file.name}
        </h4>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {new Date(file.updatedAt).toLocaleDateString()}
                </span>
            </div>
            {!isFolder && file.metadata?.batchNumber && (
                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tighter">
                   Lote: {file.metadata.batchNumber}
                </span>
            )}
        </div>
      </div>

      {/* 3. ZONA DE STATUS (RODAPÉ) */}
      <div className={`mt-4 px-5 py-3 border-t flex items-center justify-between bg-slate-50/50 
        ${isSelected ? 'border-blue-100 bg-blue-50/30' : 'border-slate-50'}`}>
         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
            {isFolder ? 'Pasta' : file.size || 'PDF'}
         </span>
         
         <div className="shrink-0">
            {!isFolder && <FileStatusBadge status={file.metadata?.status} />}
         </div>
      </div>
    </div>
  );
};
