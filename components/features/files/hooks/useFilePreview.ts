
import { useState, useEffect, useCallback, useRef } from 'react';
import { FileNode, SteelBatchMetadata, User, UserRole, normalizeRole } from '../../../../types/index.ts';
import { fileService, partnerService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';

export const useFilePreview = (user: User | null, initialFile: FileNode | null) => {
  const { showToast } = useToast();
  const [currentFile, setCurrentFile] = useState<FileNode | null>(initialFile);
  const [url, setUrl] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  
  const lastFetchTime = useRef<number>(0);
  const isMounted = useRef(true);
  const hasLoggedViewRef = useRef(false);

  const loadFileDetails = useCallback(async (id: string, force = false) => {
    if (!user || !id) return;
    
    // Evita múltiplas requisições idênticas em curto espaço de tempo (debounce técnico)
    const now = Date.now();
    if (!force && url && (now - lastFetchTime.current < 30000)) return;

    setIsSyncing(true);
    try {
        const fileData = await fileService.getFile(user, id);
        if (!isMounted.current) return;
        setCurrentFile(fileData);
        
        const signed = await fileService.getFileSignedUrl(user, id);
        if (!isMounted.current) return;
        
        setUrl(signed);
        lastFetchTime.current = Date.now();

        if (normalizeRole(user.role) === UserRole.CLIENT && !hasLoggedViewRef.current) {
            hasLoggedViewRef.current = true;
            await partnerService.logFileView(user, fileData);
        }
    } catch (e: any) {
        console.error("[useFilePreview] Falha na sincronização:", e);
        if (isMounted.current) {
            showToast("Conexão técnica interrompida. Tentando reestabelecer...", "warning");
        }
    } finally {
        if (isMounted.current) setIsSyncing(false);
    }
  }, [user, url, showToast]);

  // Listener de Visibilidade: O coração da correção para o "carregamento infinito"
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && initialFile?.id) {
        const now = Date.now();
        // Se a aba ficou escondida por mais de 5 minutos, a URL assinada pode estar instável
        const needsRefresh = (now - lastFetchTime.current > 300000); 
        if (needsRefresh || !url) {
            loadFileDetails(initialFile.id, true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [initialFile?.id, url, loadFileDetails]);

  useEffect(() => {
    isMounted.current = true;
    if (user && initialFile?.id && !url) {
        loadFileDetails(initialFile.id);
    }
    return () => { isMounted.current = false; };
  }, [initialFile?.id, user, url, loadFileDetails]);

  const handleUpdateMetadata = useCallback(async (updatedMetadata: Partial<SteelBatchMetadata>) => {
    if (!currentFile) return;
    setIsSyncing(true);
    try {
        await fileService.updateFileMetadata(currentFile.id, updatedMetadata);
        if (isMounted.current) {
            setCurrentFile(prev => prev ? ({
                ...prev,
                metadata: { ...(prev.metadata || {}), ...updatedMetadata } as SteelBatchMetadata
            }) : null);
            showToast("Ledger Vital sincronizado.", "success");
        }
    } catch (e: any) {
        if (isMounted.current) showToast("Erro ao persistir no Ledger.", "error");
    } finally {
        if (isMounted.current) setIsSyncing(false);
    }
  }, [currentFile, showToast]);

  const handleDownload = useCallback(async () => {
    if (!currentFile || !user) return;
    try {
        const downloadUrl = await fileService.getFileSignedUrl(user, currentFile.id);
        window.open(downloadUrl, '_blank');
    } catch (e) {
        showToast("Falha no download.", "error");
    }
  }, [currentFile, user, showToast]);

  return {
    currentFile, url, isSyncing, pageNum, setPageNum, zoom, setZoom,
    handleUpdateMetadata, handleDownload,
    forceRefresh: () => initialFile?.id && loadFileDetails(initialFile.id, true)
  };
};
