
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { AuditLog } from '../../../../types/index.ts';
import { fileService } from '../../../../lib/services/index.ts';

/**
 * Hook de Auditoria Técnica (SRP)
 * Focado exclusivamente no monitoramento de ações de qualidade e conformidade.
 */
export const useQualityAuditLogs = (refreshTrigger: number) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AuditLog['severity'] | 'ALL'>('ALL');
  
  const [investigation, setInvestigation] = useState<{ 
    isOpen: boolean; 
    targetLog: AuditLog | null; 
    relatedLogs: AuditLog[]; 
  }>({ isOpen: false, targetLog: null, relatedLogs: [] });

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fileService.getQualityAuditLogs(user, { search, severity: severityFilter });
      setLogs(data);
    } catch (err: any) {
      showToast(t('common.errorLoadingLogs', { message: err.message }), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, search, severityFilter, t, showToast]);

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timer);
  }, [fetchLogs, refreshTrigger]);

  const handleOpenInvestigation = useCallback((log: AuditLog) => {
    const related = logs
      .filter(l => (l.ip === log.ip && l.ip !== '10.0.0.1') || l.userId === log.userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setInvestigation({ isOpen: true, targetLog: log, relatedLogs: related });
  }, [logs]);

  return {
    qualityAuditLogs: logs,
    loadingAuditLogs: loading,
    auditLogSearch: search,
    setAuditLogSearch: setSearch,
    auditLogSeverityFilter: severityFilter,
    setAuditLogSeverityFilter: setSeverityFilter,
    isAuditLogInvestigationModalOpen: investigation.isOpen,
    setIsAuditLogInvestigationModalOpen: (open: boolean) => setInvestigation(p => ({ ...p, isOpen: open })),
    auditLogInvestigationData: { 
      targetLog: investigation.targetLog, 
      relatedLogs: investigation.relatedLogs, 
      riskScore: investigation.targetLog?.severity === 'CRITICAL' ? 90 : 20 
    },
    handleOpenQualityAuditLogInvestigation: handleOpenInvestigation,
  };
};
