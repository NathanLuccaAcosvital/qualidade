import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode, FileMetadata, UserRole } from '../../../types/index';
import { fileService, notificationService } from '../../../lib/services/index.ts';

export const useFileInspection = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(null);
  const [loadingFile, setLoadingFile] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // For inspect actions
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null); // For the preview modal
  // Refactor: Added state for the main iframe URL
  const [mainPreviewUrl, setMainPreviewUrl] = useState<string | null>(null);

  // Fetch file details when fileId or user changes
  useEffect(() => {
    const fetchFileDetails = async () => {
      if (!user || !fileId) {
        setLoadingFile(false);
        return;
      }
      setLoadingFile(true);
      try {
        // Fetch the file metadata
        // Note: Using getFiles with a high limit to find by ID is not ideal for large datasets.
        // A more efficient approach would be a dedicated getFileById method in fileService.
        const result = await fileService.getFiles(user, null, 1, 100); 
        const foundFile = result.items.find(f => f.id === fileId);

        if (foundFile) {
          setInspectorFile(foundFile);
          // Fetch the signed URL for the main preview area
          const url = await fileService.getFileSignedUrl(user, foundFile.id);
          setMainPreviewUrl(url); // Set the signed URL
        } else {
          showToast(t('files.permissionError'), 'error');
          navigate(-1); // Go back if file not found or no permission
        }
      } catch (err: any) {
        console.error("Error fetching file for inspection:", err);
        showToast(t('files.errorLoadingDocument'), 'error');
        navigate(-1);
      } finally {
        setLoadingFile(false);
      }
    };
    fetchFileDetails();
  }, [fileId, user, navigate, showToast, t]);

  const handleInspectAction = useCallback(async (action: 'APPROVE' | 'REJECT', rejectionReason?: string) => {
    if (!inspectorFile || !user) return;
    if (action === 'REJECT' && !rejectionReason?.trim()) {
      showToast(t('quality.reasonRequired'), 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const updatedMetadata: FileMetadata = {
        ...inspectorFile.metadata,
        status: (action === 'APPROVE' ? 'APPROVED' : 'REJECTED'),
        rejectionReason: action === 'REJECT' ? rejectionReason : undefined,
        inspectedAt: new Date().toISOString(),
        inspectedBy: user.name
      };

      await fileService.updateFile(user, inspectorFile.id, { metadata: updatedMetadata });

      if (inspectorFile.ownerId) {
        await notificationService.addNotification(
          inspectorFile.ownerId,
          action === 'APPROVE' ? t('quality.documentApprovedTitle') : t('quality.documentRejectedTitle'),
          t('quality.documentInspectedMessage', { fileName: inspectorFile.name, batchNumber: inspectorFile.metadata?.batchNumber }),
          action === 'APPROVE' ? 'SUCCESS' : 'ALERT',
          `/dashboard?view=files`
        );
      }
      showToast(t(`quality.document${action === 'APPROVE' ? 'Approved' : 'Rejected'}Success`, { fileName: inspectorFile.name }), 'success');

      await fileService.logAction(user, `FILE_INSPECT_${action}`, inspectorFile.name, 'DATA',
        action === 'APPROVE' ? 'INFO' : 'WARNING', 'SUCCESS',
        { fileId: inspectorFile.id, oldStatus: inspectorFile.metadata?.status, newStatus: updatedMetadata.status, rejectionReason: updatedMetadata.rejectionReason });

      setInspectorFile({ ...inspectorFile, metadata: updatedMetadata }); // Update local state
    } catch (err: any) {
      showToast(t('quality.errorProcessingInspection'), 'error');
      await fileService.logAction(user, `FILE_INSPECT_${action}`, inspectorFile?.name || 'Unknown', 'DATA',
        'ERROR', 'FAILURE', { fileId: inspectorFile?.id, reason: err.message });
    } finally {
      setIsProcessing(false);
    }
  }, [inspectorFile, user, showToast, t]);

  const handleDownload = useCallback(async (file: FileNode) => {
    if (!user) return;
    try {
        const url = await fileService.getFileSignedUrl(user, file.id);
        window.open(url, '_blank');
        showToast(t('files.downloadingFile', { fileName: file.name }), 'info');
    } catch (err) {
        showToast(t('files.permissionError'), 'error');
    }
  }, [user, showToast, t]);

  const handleSetStatusToPending = useCallback(async (file: FileNode) => {
    if (!user) return;
    if (file.metadata?.status === 'PENDING') {
      showToast(t('quality.alreadyPending'), 'info');
      return;
    }
    if (!window.confirm(t('quality.confirmSetPending', { fileName: file.name }))) return;

    setIsProcessing(true);
    try {
      const updatedMetadata: FileMetadata = {
        ...file.metadata,
        status: 'PENDING',
        rejectionReason: undefined,
        inspectedAt: new Date().toISOString(),
        inspectedBy: user.name
      };
      await fileService.updateFile(user, file.id, { metadata: updatedMetadata });
      showToast(t('quality.fileSetPendingSuccess', { fileName: file.name }), 'success');

      await fileService.logAction(user, 'FILE_STATUS_TO_PENDING', file.name, 'DATA', 'INFO', 'SUCCESS',
        { fileId: file.id, oldStatus: file.metadata?.status, newStatus: 'PENDING' });

      setInspectorFile({ ...file, metadata: updatedMetadata }); // Update local state
    } catch (err: any) {
      console.error("Erro ao mudar status para pendente:", err);
      showToast(t('quality.errorSettingPending'), 'error');
      await fileService.logAction(user, 'FILE_STATUS_TO_PENDING', file.name, 'DATA', 'ERROR', 'FAILURE',
        { fileId: file.id, reason: err.message });
    } finally {
      setIsProcessing(false);
    }
  }, [user, showToast, t]);

  const handleBackToClientFiles = () => {
    // Navigate back to the client's file list, assuming `selectedClient` is handled by parent
    navigate(-1); 
  };

  return {
    inspectorFile,
    loadingFile,
    isProcessing,
    previewFile,
    setPreviewFile,
    mainPreviewUrl, // Refactor: Added mainPreviewUrl to the return
    handleInspectAction,
    handleDownload,
    handleSetStatusToPending,
    handleBackToClientFiles,
  };
};