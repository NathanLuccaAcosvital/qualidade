
import React, { useState, useRef, useEffect } from 'react';
import { Folder, FileText, ChevronRight, CheckSquare, Square, Download, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { FileNode, FileType, UserRole } from '../../../../types/index.ts';
import { FileStatusBadge } from './FileStatusBadge.tsx';
import { useTranslation } from 'react-i18next';

interface FileViewProps {
  files: FileNode[];
  onNavigate: (id: string | null) => void;
  onSelectFileForPreview: (file: FileNode | null) => void;
  selectedFileIds: string[];
  onToggleFileSelection: (fileId: string) => void;
  onDownload: (file: FileNode) => void;
  onRename: (file: FileNode) => void;
  onDelete: (fileId: string) => void;
  userRole: UserRole; // Adicionada a prop userRole
}

export const FileListView: React.FC<FileViewProps> = ({ 
  files, 
  onNavigate, 
  onSelectFileForPreview, 
  selectedFileIds, 
  onToggleFileSelection,
  onDownload,
  onRename,
  onDelete,
  userRole // Recebe userRole
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-0"> {/* Remove space-y para controlar o espaçamento com bordas */}
      {files.map((file) => {
        const isSelected = selectedFileIds.includes(file.id);
        const IconComponent = isSelected ? CheckSquare : Square;
        return (
          <div 
            key={file.id} 
            className={`group flex items-center h-16 p-3 border-b border-slate-100 last:border-b-0 cursor-pointer transition-all 
                        ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white hover:bg-slate-50 hover:border-slate-200'}`}
            role="button"
            tabIndex={0}
            onDoubleClick={() => file.type === FileType.FOLDER ? onNavigate(file.id) : onSelectFileForPreview(file)}
          >
            <button 
              className="p-1 mr-2 text-slate-400 hover:text-[var(--color-detail-blue)] transition-colors shrink-0"
              onClick={(e) => { e.stopPropagation(); onToggleFileSelection(file.id); }}
              aria-label={t('files.selectItem', { name: file.name })}
            >
              <IconComponent size={18} className={isSelected ? 'text-[var(--color-detail-blue)]' : 'text-slate-400'} />
            </button>

            <div 
              className="flex-1 flex items-center gap-3 min-w-0"
              onClick={() => file.type === FileType.FOLDER ? onNavigate(file.id) : onSelectFileForPreview(file)}
            >
              <div className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center shadow-sm ${file.type === FileType.FOLDER ? 'bg-blue-50 text-[var(--color-detail-blue)]' : 'bg-red-50 text-red-500'}`}>
                {file.type === FileType.FOLDER ? <Folder size={18} /> : <FileText size={18} />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 group-hover:text-[var(--color-detail-blue)] transition-colors truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">{file.size || '--'}</span>
                  {file.type !== FileType.FOLDER && <FileStatusBadge status={file.metadata?.status} />}
                </div>
              </div>
            </div>
            
            <FileContextMenuTrigger 
              file={file} 
              onDownload={onDownload} 
              onRename={onRename} 
              onDelete={onDelete} 
              t={t} 
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0" // Adiciona ml-4 para espaçamento e shrink-0 para não espremer
              userRole={userRole} // Passa userRole para o ContextMenu
            />
          </div>
        );
      })}
    </div>
  );
};

export const FileGridView: React.FC<FileViewProps> = ({ 
  files, 
  onNavigate, 
  onSelectFileForPreview, 
  selectedFileIds, 
  onToggleFileSelection,
  onDownload,
  onRename,
  onDelete,
  userRole // Recebe userRole
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {files.map((file) => {
        const isSelected = selectedFileIds.includes(file.id);
        const IconComponent = isSelected ? CheckSquare : Square;
        return (
          <div 
            key={file.id}
            className={`relative flex flex-col items-center p-4 rounded-2xl cursor-pointer border text-center group transition-all ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}`}
            role="button"
            tabIndex={0}
            onDoubleClick={() => file.type === FileType.FOLDER ? onNavigate(file.id) : onSelectFileForPreview(file)}
          >
            <button 
              className="absolute top-2 left-2 p-1 text-slate-400 hover:text-[var(--color-detail-blue)] z-10 transition-colors"
              onClick={(e) => { e.stopPropagation(); onToggleFileSelection(file.id); }}
              aria-label={t('files.selectItem', { name: file.name })}
            >
              <IconComponent size={20} className={isSelected ? 'text-[var(--color-detail-blue)]' : 'text-slate-400'} />
            </button>

            <div 
              className="flex flex-col items-center flex-1 w-full pt-4" // Added pt-4 to account for checkbox
              onClick={() => file.type === FileType.FOLDER ? onNavigate(file.id) : onSelectFileForPreview(file)}
            >
              <div className={`w-16 h-16 mb-3 flex items-center justify-center rounded-2xl shadow-sm transition-all group-hover:scale-110 ${file.type === FileType.FOLDER ? 'bg-blue-50 text-[var(--color-detail-blue)]' : 'bg-red-50 text-red-500'}`}>
                {file.type === FileType.FOLDER ? <Folder size={32} /> : <FileText size={32} />}
              </div>
              <p className="text-sm font-semibold text-slate-700 line-clamp-2 leading-tight group-hover:text-[var(--color-detail-blue)]">{file.name}</p>
              {file.type !== FileType.FOLDER && (
                <div className="mt-2 scale-75">
                  <FileStatusBadge status={file.metadata?.status} />
                </div>
              )}
            </div>
            
            <FileContextMenuTrigger 
              file={file} 
              onDownload={onDownload} 
              onRename={onRename} 
              onDelete={onDelete} 
              t={t} 
              className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              userRole={userRole} // Passa userRole para o ContextMenu
            />
          </div>
        );
      })}
    </div>
  );
};

interface FileContextMenuTriggerProps {
  file: FileNode;
  onDownload: (file: FileNode) => void;
  onRename: (file: FileNode) => void;
  onDelete: (fileId: string) => void;
  t: any;
  className?: string;
  userRole: UserRole; // Adicionada a prop userRole
}

const FileContextMenuTrigger: React.FC<FileContextMenuTriggerProps> = ({ file, onDownload, onRename, onDelete, t, className, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isClient = userRole === UserRole.CLIENT;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  const handleAction = (action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    action();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button 
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all"
        title={t('common.moreOptions')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef} 
          className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 animate-in zoom-in-95 duration-150 origin-top-right"
        >
          {file.type !== FileType.FOLDER && (
            <ContextMenuItem 
              icon={Download} 
              label={t('files.downloadButton')} 
              onClick={(e) => handleAction(() => onDownload(file), e)} 
            />
          )}
          {/* Renomear e Excluir são visíveis apenas para não-clientes */}
          {!isClient && (
            <>
              <ContextMenuItem 
                icon={Edit2} 
                label={t('files.rename.title')} 
                onClick={(e) => handleAction(() => onRename(file), e)} 
              />
              <ContextMenuItem 
                icon={Trash2} 
                label={t('common.delete')} 
                onClick={(e) => handleAction(() => onDelete(file.id), e)} 
                colorClass="text-red-500 hover:bg-red-50"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ContextMenuItem: React.FC<{ icon: React.ElementType; label: string; onClick: (e: React.MouseEvent) => void; colorClass?: string }> = ({ icon: Icon, label, onClick, colorClass = "text-slate-700 hover:bg-slate-50" }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${colorClass}`}
  >
    <Icon size={14} className="shrink-0" /> {label}
  </button>
);
