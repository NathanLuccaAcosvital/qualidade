
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { partnerService, fileService } from '../../../../lib/services/index.ts';
import { FileNode, BreadcrumbItem, User } from '../../../../types/index.ts';

/**
 * Hook Especializado para Biblioteca do Parceiro.
 * Gerencia a navegação auto-root e a hierarquia de certificados.
 */
export const usePartnerCertificates = (folderIdFromParams: string | null, searchTerm: string) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const loadData = useCallback(async () => {
    // Se o auth ainda está carregando ou se o usuário não tem orgId, não tenta buscar arquivos
    if (isAuthLoading) return;
    
    if (!user?.organizationId) {
      setIsLoading(false);
      setFiles([]);
      return;
    }

    setIsLoading(true);
    try {
      const [filesRes, breadcrumbsRes] = await Promise.all([
        partnerService.getCertificates(user.organizationId, folderIdFromParams, searchTerm),
        fileService.getBreadcrumbs(user as User, folderIdFromParams)
      ]);
      
      setFiles(filesRes.items);
      setBreadcrumbs(breadcrumbsRes);
    } catch (err) {
      console.error("[PartnerCertificates] Falha na sincronização técnica:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, folderIdFromParams, searchTerm, isAuthLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { files, isLoading, breadcrumbs, refresh: loadData };
};
