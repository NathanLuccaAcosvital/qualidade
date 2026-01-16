
import React, { useState, useRef, useEffect } from 'react';
import { Folder, FileText, ChevronRight, CheckSquare, Square, Download, Trash2, Edit2, MoreVertical, Eye, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { FileNode, FileType, UserRole, QualityStatus } from '../../../../types/index.ts';
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
  userRole: UserRole;
}

export const FileListView: React.FC<FileViewProps> = ({ 
  files, onNavigate, onSelectFileForPreview, selectedFileIds, onToggleFileSelection, onDownload, onRename, onDelete, userRole 
}) => {
  const { t } = useTranslation();
  const isClient = userRole === UserRole.CLIENT;

  return (
    <div className="space-y-1">
      {files.map((file) => {
        const isSelected = selectedFileIds.includes(file.id);
        const isToDelete = file.metadata?.status === QualityStatus.TO_DELETE;
        const isFolder = file.type === FileType.FOLDER;
        const isRootItem = file.parentId === null;
        
        // Regra Vital: Apenas Staff pode gerenciar. Pastas Raiz não podem ser apagadas.
        const canDelete = !isClient && !(isFolder && isRootItem);
        const canRename = !isClient;

        return (
          <div 
            key={file.id} 
            className={`group flex items-center h-14 p-2 rounded-xl transition-all 
                        ${isSelected ? 'bg-blue-50 ring-1 ring-blue-100' : 'hover:bg-slate-50'}`}
          >
            <div 
              className="flex-1 flex items-center gap-4 min-w-0 cursor-pointer px-2"
              onClick={() => isFolder ? onNavigate(file.id) : onSelectFileForPreview(file)}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
                ${isFolder ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                {isFolder ? <Folder size={20} fill="currentColor" className="opacity-20" /> : <FileText size={20} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold truncate ${isToDelete ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {file.name}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">{file.size || (isFolder ? '--' : 'PDF')}</span>
                  {!isFolder && <FileStatusBadge status={file.metadata?.status} />}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
               {!isClient && (
                 <>
                   <button 
                    onClick={(e) => { e.stopPropagation(); onRename(file); }}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title={t('files.rename.title')}
                   >
                      <Edit2 size={14} />
                   </button>
                   {canDelete && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title={t('files.delete.button')}
                      >
                          <Trash2 size={14} />
                      </button>
                   )}
                 </>
               )}
               {isFolder ? <ChevronRight size={16} className="text-slate-300" /> : <ArrowUpRight size={16} className="text-blue-500" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const FileGridView: React.FC<FileViewProps> = ({ 
  files, onNavigate, onSelectFileForPreview, selectedFileIds, onToggleFileSelection, onDownload, onRename, onDelete, userRole 
}) => {
  const { t } = useTranslation();
  const isClient = userRole === UserRole.CLIENT;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {files.map((file) => {
        const isSelected = selectedFileIds.includes(file.id);
        const isToDelete = file.metadata?.status === QualityStatus.TO_DELETE;
        const isFolder = file.type === FileType.FOLDER;
        const isRootItem = file.parentId === null;

        const canDelete = !isClient && !(isFolder && isRootItem);

        return (
          <div 
            key={file.id}
            className={`relative flex flex-col group p-4 rounded-[2rem] cursor-pointer border-2 transition-all 
                        ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:border-slate-100 hover:shadow-xl hover:-translate-y-1'}`}
          >
            <div 
              className="flex flex-col items-center text-center w-full pt-2"
              onClick={() => isFolder ? onNavigate(file.id) : onSelectFileForPreview(file)}
            >
              <div className={`w-16 h-16 mb-4 flex items-center justify-center rounded-[1.5rem] shadow-sm transition-transform group-hover:scale-110 
                               ${isFolder ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                {isFolder ? <Folder size={32} fill="currentColor" className="opacity-10" /> : <FileText size={32} />}
              </div>
              <p className={`text-[11px] font-black uppercase tracking-tight line-clamp-2 leading-tight px-1 mb-2 ${isToDelete ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                {file.name}
              </p>
              {!isFolder && (
                <div className="mt-auto pt-2 border-t border-slate-50 w-full flex justify-center scale-90">
                  <FileStatusBadge status={file.metadata?.status} />
                </div>
              )}
              {isFolder && (
                <div className="mt-auto text-[9px] font-black text-slate-300 uppercase tracking-widest">Acessar Pasta</div>
              )}
            </div>
            
            <div className="absolute top-4 left-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isClient && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRename(file); }}
                      className="p-1.5 bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-blue-500 rounded-lg transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                    {canDelete && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
                        className="p-1.5 bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </>
                )}
            </div>

            {/* Impede a seleção de pastas raiz para exclusão em massa */}
            {canDelete && (
              <button 
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-blue-600 transition-colors"
                onClick={(e) => { e.stopPropagation(); onToggleFileSelection(file.id); }}
              >
                {isSelected ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} />}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
