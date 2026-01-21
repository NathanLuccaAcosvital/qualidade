import { useState, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { fileService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileType, UserRole } from '../../../../types/index.ts';

/**
 * useFileOperations (Mutation Only)
 * Responsabilidade: Executar ações de criação, upload, renomeação e exclusão.
 */
export const useFileOperations = (ownerId?: string | null, onMutationSuccess?: () => void) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const getTargetOwnerId = useCallback(() => {
    return (ownerId && ownerId !== 'global') 
      ? ownerId 
      : (user?.role === UserRole.CLIENT ? user.organizationId : null);
  }, [ownerId, user]);

  const handleUploadBatch = useCallback(async (files: File[], parentId: string | null) => {
    const targetId = getTargetOwnerId();
    if (!user || !targetId) {
      showToast(t('files.upload.noOrgLinked'), 'error');
      return;
    }

    setIsProcessing(true);
    setUploadProgress({ current: 0, total: files.length });
    
    try {
      let successCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });
        
        await fileService.uploadFile(user, {
          name: file.name,
          fileBlob: file,
          parentId,
          type: file.type.startsWith('image/') ? FileType.IMAGE : FileType.PDF,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          mimeType: file.type
        }, targetId);
        
        successCount++;
      }
      
      showToast(`${successCount} arquivo(s) sincronizado(s) com sucesso!`, 'success');
      onMutationSuccess?.();
    } catch (err: any) {
      showToast(`Falha parcial: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  }, [user, getTargetOwnerId, showToast, t, onMutationSuccess]);

  const handleCreateFolder = useCallback(async (name: string, parentId: string | null) => {
    const targetId = getTargetOwnerId();
    if (!user || (!targetId && user.role === UserRole.CLIENT)) {
      showToast(t('files.createFolder.noOrgLinked'), "error");
      return;
    }

    setIsProcessing(true);
    try {
      await fileService.createFolder(user, parentId, name, targetId || undefined);
      showToast(t('files.createFolder.success'), 'success');
      onMutationSuccess?.();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [user, getTargetOwnerId, showToast, t, onMutationSuccess]);

  const handleDelete = useCallback(async (fileIds: string[]) => {
    if (!user || fileIds.length === 0) return;
    setIsProcessing(true);
    try {
      await fileService.deleteFile(user, fileIds);
      showToast(t('files.delete.success'), 'success');
      onMutationSuccess?.();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [user, showToast, t, onMutationSuccess]);

  const handleRename = useCallback(async (fileId: string, newName: string) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      await fileService.renameFile(user, fileId, newName);
      showToast(t('files.rename.success'), 'success');
      onMutationSuccess?.();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [user, showToast, t, onMutationSuccess]);

  return { 
    isProcessing, 
    uploadProgress,
    handleUploadBatch, 
    handleCreateFolder, 
    handleDelete, 
    handleRename 
  };
};