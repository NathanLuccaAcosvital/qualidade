import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, FileText, Folder, X, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FileNode, FileType } from '../../types/index.ts';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (term: string) => Promise<FileNode[]>;
  onNavigateToFile: (file: FileNode) => void;
  onNavigateToFolder: (folderId: string | null) => void;
  isLoadingResults: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, onClose, onSearch, onNavigateToFile, onNavigateToFolder, isLoadingResults
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FileNode[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchTerm('');
      setSearchResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle Cmd+K / Ctrl+K to open/close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // This component doesn't control its own `isOpen` state,
          // but the parent `ClientPage` does. We only care about opening here if it's currently closed.
          // The parent will set `isOpen` to true which will trigger effects.
          // No need to call onClose/onOpen from here as it's handled by ClientPage.
        }
      } else if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearchChange = useCallback(async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const results = await onSearch(term);
      setSearchResults(results);
      setSelectedIndex(0);
    } else {
      setSearchResults([]);
    }
  }, [onSearch]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex(prev => (prev + 1) % searchResults.length);
      resultsRef.current?.children[selectedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
      resultsRef.current?.children[selectedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (searchResults[selectedIndex]) {
        const item = searchResults[selectedIndex];
        if (item.type === FileType.FOLDER) {
          onNavigateToFolder(item.id);
        } else {
          onNavigateToFile(item);
        }
        onClose();
      }
    }
  }, [searchResults, selectedIndex, onNavigateToFile, onNavigateToFolder, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-12 animate-in fade-in duration-200">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="relative flex items-center p-4 border-b border-slate-200/50">
          <Search size={20} className="text-slate-400 absolute left-6" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('files.searchPlaceholder')}
            className="w-full pl-14 pr-12 py-3 bg-transparent outline-none text-base font-medium text-slate-800 placeholder-slate-400"
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={t('files.searchPlaceholder')}
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-12 p-2 text-slate-400 hover:text-slate-700"
              aria-label={t('common.clear')}
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="absolute right-4 p-2.5 bg-slate-100/50 rounded-lg text-slate-500 hover:bg-slate-200/80 transition-colors"
            aria-label={t('common.close')}
          >
            <X size={16} />
          </button>
        </div>

        {isLoadingResults && searchTerm.trim() && (
          <div className="flex items-center justify-center p-8 text-blue-500">
            <Loader2 size={24} className="animate-spin mr-3" />
            <span className="text-sm font-semibold text-slate-600">{t('common.loading')}</span>
          </div>
        )}

        {!isLoadingResults && searchResults.length > 0 && (
          <div ref={resultsRef} className="max-h-96 overflow-y-auto custom-scrollbar p-2">
            {searchResults.map((item, index) => {
              const Icon = item.type === FileType.FOLDER ? Folder : FileText;
              const isSelected = index === selectedIndex;
              const pathParts = item.storagePath.split('/').filter(Boolean); // Assuming storagePath contains path
              const parentFolderName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : null; // Get parent folder name

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.type === FileType.FOLDER) {
                      onNavigateToFolder(item.id);
                    } else {
                      onNavigateToFile(item);
                    }
                    onClose();
                  }}
                  className={`flex items-center w-full p-3 my-1 rounded-xl transition-all ${
                    isSelected ? 'bg-blue-500 text-white shadow-md' : 'bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <Icon size={20} className={`mr-4 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`} />
                  <div className="flex-1 text-left">
                    <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {item.name}
                    </p>
                    {parentFolderName && (
                      <p className={`text-xs ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                        {parentFolderName} <ChevronRight size={10} className="inline-block" /> {item.name}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!isLoadingResults && searchTerm.trim() && searchResults.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">
            {t('files.noResultsFound')}
          </div>
        )}

        {!searchTerm.trim() && !isLoadingResults && (
          <div className="p-8 text-center text-slate-400 text-sm italic">
            {t('files.typeToSearch')}
          </div>
        )}
      </div>
    </div>
  );
};