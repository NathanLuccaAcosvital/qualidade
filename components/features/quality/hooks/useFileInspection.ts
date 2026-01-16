import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { FileNode, QualityStatus } from '../../../../types/index.ts';
import { qualityService, fileService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts'; // Import supabase directly

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
    if (!user || !fileId) {
      setLoadingFile(false);
      return;
    }
    setLoadingFile(true);
    try {
      // Directly fetch the file by its ID for inspection
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        // Map raw data to domain FileNode
        const foundFile: FileNode = {
          id: data.id,
          parentId: data.parent_id,
          name: data.name,
          type: data.type,
          size: data.size,
          updatedAt: data.updated_at,
          ownerId: data.owner_id,
          storagePath: data.storage_path,
          isFavorite: data.is_favorite,
          metadata: data.metadata 
        };
        setInspectorFile(foundFile);
        const url = await fileService.getSignedUrl(foundFile.storagePath);
        setMainPreviewUrl(url);
      } else {
        showToast("Documento não encontrado.", 'error');
        navigate(-1);
      }
    } catch (err: any) {
      console.error("Falha na sincronização técnica para inspeção:", err);
      showToast("Falha na sincronização técnica para inspeção: " + err.message, 'error');
      navigate(-1);
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
