
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { FileNode, SteelBatchMetadata, QualityStatus } from '../../../../types/index.ts';
import { fileService, notificationService } from '../../../../lib/services/index.ts';

/**
 * Hook de Inspeção Metalúrgica (S)
 * Única responsabilidade: Gerenciar o ciclo de vida da aprovação/reprovação técnica de um lote.
 */
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
      const result = await fileService.getFiles(user, null, 1, 1000); 
      const found = result.items.find(f => f.id === fileId);

      if (found) {
        setInspectorFile(found);
        const url = await fileService.getFileSignedUrl(user, found.id);
        setMainPreviewUrl(url);
      } else {
        showToast("Documento não localizado no cluster.", 'error');
        navigate(-1);
      }
    } catch (err) {
      showToast("Falha na sincronização do documento.", 'error');
    } finally {
      setLoadingFile(false);
    }
  }, [fileId, user, navigate, showToast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleInspectAction = async (action: 'APPROVE' | 'REJECT', reason?: string) => {
    if (!inspectorFile || !user) return;
    setIsProcessing(true);
    
    try {
      const status = action === 'APPROVE' ? QualityStatus.APPROVED : QualityStatus.REJECTED;
      const updatedMetadata: SteelBatchMetadata = {
        ...(inspectorFile.metadata as SteelBatchMetadata),
        status,
        rejectionReason: reason,
        inspectedAt: new Date().toISOString(),
        inspectedBy: user.name
      };

      await fileService.updateFile(user, inspectorFile.id, { metadata: updatedMetadata });

      if (inspectorFile.ownerId) {
        await notificationService.addNotification(
          inspectorFile.ownerId,
          status === QualityStatus.APPROVED ? "Certificado Aprovado" : "Não-Conformidade Detectada",
          `O certificado ${inspectorFile.name} foi validado tecnicamente.`,
          status === QualityStatus.APPROVED ? 'SUCCESS' : 'ALERT'
        );
      }

      showToast(`Ciclo de auditoria encerrado: ${action}`, 'success');
      setInspectorFile(prev => prev ? ({ ...prev, metadata: updatedMetadata }) : null);
    } catch (err) {
      showToast("Falha ao gravar inspeção no ledger.", 'error');
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
        const url = await fileService.getFileSignedUrl(user!, file.id);
        window.open(url, '_blank');
      } catch { showToast("Erro ao baixar PDF.", 'error'); }
    },
    handleBackToClientFiles: () => navigate(-1)
  };
};
