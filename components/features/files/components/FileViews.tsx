
import React from 'react';
import { Folder, FileText, ChevronRight } from 'lucide-react';
import { FileNode, FileType } from '../../../../types/index.ts';
import { FileStatusBadge } from './FileStatusBadge.tsx';

interface FileViewProps {
  files: FileNode[];
  onNavigate: (id: string | null) => void;
  onSelect?: (file: FileNode | null) => void;
}

export const FileListView: React.FC<FileViewProps> = ({ files, onNavigate, onSelect }) => (
  <div className="space-y-1">
    {files.map((file) => (
      <div 
        key={file.id} 
        onClick={() => file.type === FileType.FOLDER ? onNavigate(file.id) : onSelect?.(file)}
        className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-200 transition-all"
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${file.type === FileType.FOLDER ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
            {file.type === FileType.FOLDER ? <Folder size={20} /> : <FileText size={20} />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{file.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] text-slate-400 font-mono">{file.size || '--'}</span>
              {file.type !== FileType.FOLDER && <FileStatusBadge status={file.metadata?.status} />}
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
      </div>
    ))}
  </div>
);

export const FileGridView: React.FC<FileViewProps> = ({ files, onNavigate, onSelect }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {files.map((file) => (
      <div 
        key={file.id}
        onClick={() => file.type === FileType.FOLDER ? onNavigate(file.id) : onSelect?.(file)}
        className="flex flex-col items-center p-4 hover:bg-slate-50 rounded-2xl cursor-pointer border border-transparent hover:border-slate-200 transition-all text-center group"
        role="button"
        tabIndex={0}
      >
        <div className={`w-16 h-16 mb-3 flex items-center justify-center rounded-2xl shadow-sm transition-all group-hover:scale-110 ${file.type === FileType.FOLDER ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
          {file.type === FileType.FOLDER ? <Folder size={32} /> : <FileText size={32} />}
        </div>
        <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-tight group-hover:text-blue-600">{file.name}</p>
        {file.type !== FileType.FOLDER && (
          <div className="mt-2 scale-75">
            <FileStatusBadge status={file.metadata?.status} />
          </div>
        )}
      </div>
    ))}
  </div>
);
