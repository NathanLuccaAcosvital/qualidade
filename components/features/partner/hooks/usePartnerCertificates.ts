import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { partnerService, fileService } from '../../../../lib/services/index.ts';
import { FileNode, BreadcrumbItem, User } from '../../../../types/index.ts';

export const usePartnerCertificates = (folderId: string | null, searchTerm: string) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ approvedCount: 0, lastAnalysis: '' });
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const loadData = useCallback(async () => {
    if (!user?.organizationId) return;
    setIsLoading(true);
    try {
      const [filesRes, statsRes, breadcrumbsRes] = await Promise.all([
        partnerService.getCertificates(user.organizationId, folderId, searchTerm),
        partnerService.getComplianceOverview(user.organizationId),
        // Fix: Added 'user' as the first argument to getBreadcrumbs to match IFileService interface
        fileService.getBreadcrumbs(user as User, folderId)
      ]);
      setFiles(filesRes.items);
      setStats(statsRes);
      setBreadcrumbs(breadcrumbsRes);
    } catch (err) {
      console.error("Partner Sync Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, folderId, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { files, isLoading, stats, breadcrumbs, refresh: loadData };
};