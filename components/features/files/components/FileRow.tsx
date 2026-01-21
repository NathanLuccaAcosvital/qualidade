import React from 'react';
import { CheckSquare, Square, Clock, HardDrive, Eye, Edit2, Trash2, FileText, Folder } from 'lucide-react';
import { FileNode, FileType, UserRole } from '../../../../types/index.ts';
import { FileStatusBadge } from './FileStatusBadge.tsx';

interface FileRowProps {
  file: FileNode;
  isSelected: boolean;
  onNavigate: (id: string | null) => void;
  onPreview: (file: FileNode) => void;
  onToggleSelection: (fileId: string) => void;
  onRename: (file: FileNode) => void;
  onDelete: (fileId: string) => void;
  userRole: UserRole;
}

export const FileRow: React.FC<FileRowProps> = ({ 
  file, isSelected, onNavigate, onPreview, onToggleSelection, onRename, onDelete, userRole 
}) => {
  const isFolder = file.type === FileType.FOLDER;
  const isClient = userRole === UserRole.CLIENT;
  const isRootFolder = isFolder && file.parentId === null;
  
  return (
    <div 
      className={`group flex items-center px-8 py-4 hover:bg-slate-50 transition-all cursor-pointer relative border-b border-slate-100 last:border-0
        ${isSelected ? 'bg-blue-50/50' : ''}`}
      onClick={() => isFolder ? onNavigate(file.id) : onPreview(file)}
    >
      <div className="flex-1 min-w-0 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 bg-slate-50 group-hover:bg-white transition-colors ${isSelected ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-400'}`}>
          {isFolder ? <Folder size={18} /> : <FileText size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className={`text-[13px] tracking-tight uppercase transition-colors truncate ${isSelected || isFolder ? 'font-bold text-slate-900' : 'font-medium text-slate-600 group-hover:text-slate-900'}`}>
              {file.name}
            </span>
          </div>
        </div>
      </div>

      <div className="w-32">
        {!isFolder && <FileStatusBadge status={file.metadata?.status} />}
      </div>

      <div className="w-24 flex items-center justify-end gap-1">
        {!isClient && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onRename(file); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all" title="Renomear"><Edit2 size={14} /></button>
            {!isRootFolder && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(file.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all" title="Excluir"><Trash2 size={14} /></button>
            )}
          </div>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleSelection(file.id); }}
          className={`p-1.5 rounded-lg transition-all ${isSelected ? 'text-blue-600' : 'text-slate-200 hover:text-slate-400'}`}
        >
          {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
        </button>
      </div>
    </div>
  );
};