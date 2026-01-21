import React from 'react';
import { FileNode, FileType, UserRole } from '../../../../types/index.ts';
import { FileRow } from './FileRow.tsx';
import { FileCard } from './FileCard.tsx';

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

/**
 * FileListView (Collection View)
 */
export const FileListView: React.FC<FileViewProps> = ({ 
  files, onNavigate, onSelectFileForPreview, selectedFileIds, onToggleFileSelection, onRename, onDelete, userRole
}) => {
  return (
    <div className="min-w-full divide-y divide-slate-100 bg-white">
      {/* Cabeçalho Refatorado para Clareza e Alinhamento */}
      <div className="hidden md:flex items-center px-8 py-5 bg-slate-50 border-b border-slate-200">
        <div className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
          Identificador / Nome do Ativo
        </div>
        <div className="w-24 hidden lg:block text-right px-4 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
          Tamanho
        </div>
        <div className="w-40 hidden md:block px-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
          Atualização
        </div>
        <div className="w-32 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
          Status
        </div>
        <div className="w-24 text-right text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
          Ações
        </div>
      </div>
      
      {files.map((file) => (
        <FileRow 
          key={file.id}
          file={file}
          isSelected={selectedFileIds.includes(file.id)}
          onNavigate={onNavigate}
          onPreview={onSelectFileForPreview}
          onToggleSelection={onToggleFileSelection}
          onRename={onRename}
          onDelete={onDelete}
          userRole={userRole}
        />
      ))}
    </div>
  );
};

/**
 * FileGridView (Collection View)
 */
export const FileGridView: React.FC<FileViewProps> = ({ 
  files, onNavigate, onSelectFileForPreview, selectedFileIds, onToggleFileSelection, onRename, onDelete, userRole
}) => {
  return (
    <>
      {files.map((file) => (
        <FileCard 
          key={file.id}
          file={file}
          isSelected={selectedFileIds.includes(file.id)}
          onNavigate={onNavigate}
          onPreview={onSelectFileForPreview}
          onToggleSelection={onToggleFileSelection}
          onRename={onRename}
          onDelete={onDelete}
          userRole={userRole}
        />
      ))}
    </>
  );
};