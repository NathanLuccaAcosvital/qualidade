
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { FileNode, SteelBatchMetadata, QualityStatus, FileType } from '../../../../types/index.ts';
import { qualityService, fileService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';

export const useFileInspection = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(null);
  const [loadingFile, setLoadingFile] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mainPreviewUrl, setMainPreviewUrl] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!user || !fileId) return;
    setLoadingFile(true);
    try {
      const file = await fileService.getFile(user, fileId);
      setInspectorFile(file);

      if (file.storagePath && file.storagePath !== 'system/folder') {
          try {
              const url = await fileService.getSignedUrl(file.storagePath);
              setMainPreviewUrl(url);
          } catch (urlErr) {
              console.warn("[Quality Sync] Could not sign asset URL:", urlErr);
          }
      }
    } catch (err: any) {
      showToast(err.message || "Falha na sincronização técnica.", 'error');
      navigate(-1);
    } finally {
      setLoadingFile(false);
    }
  }, [fileId, user, navigate, showToast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleInspectAction = async (updates: Partial<SteelBatchMetadata>) => {
    if (!inspectorFile || !user) return;
    setIsProcessing(true);
    try {
      await qualityService.submitVeredict(user, inspectorFile, updates);
      setInspectorFile(prev => prev ? ({ 
        ...prev, 
        metadata: { ...prev.metadata!, ...updates } as SteelBatchMetadata
      }) : null);
    } catch (err) {
      showToast("Falha ao gravar veredito no ledger.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNewVersion = async (file: File) => {
    if (!inspectorFile || !user) return;
    setIsProcessing(true);
    try {
      const currentVersion = inspectorFile.versionNumber || 1;
      const nextVersion = currentVersion + 1;
      const sanitizedName = file.name.replace(/\s+/g, '_').toLowerCase();
      const filePath = `${inspectorFile.ownerId}/versions/v${nextVersion}_${Date.now()}_${sanitizedName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const historicalEntry = {
        version: currentVersion,
        storagePath: inspectorFile.storagePath,
        createdAt: inspectorFile.updatedAt || new Date().toISOString(),
        createdBy: user.name,
        note: "Substituído por nova versão técnica."
      };

      const updatedMetadata = {
        ...(inspectorFile.metadata || {}),
        versionHistory: [historicalEntry, ...(inspectorFile.metadata?.versionHistory || [])],
        signatures: { step1_release: inspectorFile.metadata?.signatures?.step1_release },
        status: QualityStatus.SENT,
        documentalStatus: 'PENDING',
        physicalStatus: 'PENDING',
        currentStep: 2
      };

      const { error: updateError } = await supabase
        .from('files')
        .update({
          storage_path: uploadData.path,
          version_number: nextVersion,
          metadata: updatedMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', inspectorFile.id);

      if (updateError) throw updateError;
      showToast(`Versão v${nextVersion}.0 efetivada.`, "success");
      await fetchDetails();
    } catch (err) {
      showToast("Falha crítica ao gerar nova versão.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * UPLOAD DE EVIDÊNCIA COM SEPARAÇÃO DE PASTAS NO LEDGER
   */
  const handleUploadStepEvidence = async (file: File, step: 'documental' | 'physical') => {
    if (!inspectorFile || !user) return;
    setIsProcessing(true);
    try {
      // 1. Criar/Localizar Pasta Raiz de Evidências do Lote
      const { data: rootFolder, error: rootError } = await supabase.from('files').upsert({
        name: `Evidências - ${inspectorFile.name}`,
        type: FileType.FOLDER,
        parent_id: inspectorFile.parentId,
        owner_id: inspectorFile.ownerId,
        storage_path: 'system/folder',
        metadata: { is_evidence_root: true, linked_file_id: inspectorFile.id }
      }, { onConflict: 'name,parent_id' }).select().single();
      if (rootError) throw rootError;

      // 2. Criar/Localizar Subpasta do Passo
      const stepFolderName = step === 'documental' ? 'P2 - Documental' : 'P3 - Vistoria de Carga';
      const { data: stepFolder, error: stepError } = await supabase.from('files').upsert({
        name: stepFolderName,
        type: FileType.FOLDER,
        parent_id: rootFolder.id,
        owner_id: inspectorFile.ownerId,
        storage_path: 'system/folder',
        metadata: { step_context: step }
      }, { onConflict: 'name,parent_id' }).select().single();
      if (stepError) throw stepError;

      // 3. Upload Físico
      const sanitizedName = file.name.replace(/\s+/g, '_').toLowerCase();
      const storagePath = `${inspectorFile.ownerId}/evidence/${step}/${Date.now()}_${sanitizedName}`;
      const { error: storageError } = await supabase.storage.from('certificates').upload(storagePath, file);
      if (storageError) throw storageError;

      // 4. Registrar arquivo individual no Ledger para visibilidade no explorer
      await supabase.from('files').insert({
        name: file.name,
        type: FileType.IMAGE,
        parent_id: stepFolder.id,
        owner_id: inspectorFile.ownerId,
        storage_path: storagePath,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        metadata: { source_step: step, parent_batch: inspectorFile.id }
      });

      // 5. Atualizar metadados do laudo principal para visualização rápida no Workflow
      const metadataKey = step === 'documental' ? 'documentalPhotos' : 'physicalPhotos';
      const currentPhotos = (inspectorFile.metadata as any)?.[metadataKey] || [];
      const updatedPhotos = [...currentPhotos, storagePath];

      await handleInspectAction({ [metadataKey]: updatedPhotos });
      showToast("Evidência arquivada com sucesso.", "success");
    } catch (err) {
      console.error("Erro no upload de evidência:", err);
      showToast("Erro ao processar anexo.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    inspectorFile, loadingFile, isProcessing,
    mainPreviewUrl, handleInspectAction,
    handleUploadStepEvidence, handleCreateNewVersion,
    user, handleDownload: async (file: FileNode) => {
      try {
        const url = await fileService.getSignedUrl(file.storagePath);
        window.open(url, '_blank');
      } catch { showToast("Erro ao baixar PDF.", 'error'); }
    },
    handleBackToClientFiles: () => navigate(-1)
  };
};
