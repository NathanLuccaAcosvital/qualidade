import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { FileNode, QualityStatus } from '../../../../types/index.ts';
import { qualityService, fileService } from '../../../../lib/services/index.ts';

export const useFileInspection = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(null);
  const [loadingFile, setLoadingFile] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mainPreviewUrl, setMainPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!user || !fileId) return;
    setLoadingFile(true);
    try {
      // O analista de qualidade usa o explorer de portfólio para achar o arquivo original
      const result = await qualityService.getPortfolioFileExplorer(user.id, null);
      const found = result.items.find(f => f.id === fileId);

      if (found) {
        setInspectorFile(found);
        const url = await fileService.getSignedUrl(found.storagePath);
        setMainPreviewUrl(url);
      } else {
        showToast("Arquivo fora da sua área de auditoria.", 'error');
        navigate(-1);
      }
    } catch (err) {
      showToast("Falha na sincronização técnica.", 'error');
    } finally {
      setLoadingFile(false);
    }
  }, [fileId, user, navigate, showToast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleInspectAction = async (status: QualityStatus, reason?: string) => {
    if (!inspectorFile || !user) return;
    setIsProcessing(true);
    
    try {
      await qualityService.submitVeredict(user, inspectorFile, status, reason);
      showToast(`Veredito '${status}' registrado.`, 'success');
      // Atualiza estado local para refletir mudança sem reload
      setInspectorFile(prev => prev ? ({ ...prev, metadata: { ...prev.metadata!, status, rejectionReason: reason } }) : null);
    } catch (err) {
      showToast("Falha ao gravar veredito no ledger.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    inspectorFile,
    loadingFile,
    isProcessing,
    mainPreviewUrl,
    handleInspectAction,
    previewFile,
    setPreviewFile,
    handleDownload: async (file: FileNode) => {
      try {
        const url = await fileService.getSignedUrl(file.storagePath);
        window.open(url, '_blank');
      } catch { showToast("Erro ao baixar PDF.", 'error'); }
    },
    handleBackToClientFiles: () => navigate(-1)
  };
};