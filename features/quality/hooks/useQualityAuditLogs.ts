import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { AuditLog } from '../../../types/index';
import { fileService } from '../../../lib/services/index.ts';

export const useQualityAuditLogs = (refreshTrigger: number) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [qualityAuditLogs, setQualityAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [auditLogSearch, setAuditLogSearch] = useState('');
  const [auditLogSeverityFilter, setAuditLogSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'>('ALL');
  const [isAuditLogInvestigationModalOpen, setIsAuditLogInvestigationModalOpen] = useState(false);
  const [auditLogInvestigationData, setAuditLogInvestigationData] = useState<{ targetLog: AuditLog | null; relatedLogs: AuditLog[]; riskScore: number; }>({ targetLog: null, relatedLogs: [], riskScore: 0 });

  // Carregamento de Logs de Auditoria da Qualidade
  useEffect(() => {
    if (!user) return;

    const loadQualityLogs = async () => {
      setLoadingAuditLogs(true);
      try {
        const logs = await fileService.getQualityAuditLogs(user, {
          search: auditLogSearch,
          severity: auditLogSeverityFilter
        });
        setQualityAuditLogs(logs);
      } catch (err: any) {
        console.error("Erro ao carregar logs de auditoria da qualidade:", err.message);
        showToast(t('common.errorLoadingLogs', { message: err.message }), 'error');
        setQualityAuditLogs([]);
      } finally {
        setLoadingAuditLogs(false);
      }
    };

    const timer = setTimeout(loadQualityLogs, 300);
    return () => clearTimeout(timer);
  }, [user, auditLogSearch, auditLogSeverityFilter, refreshTrigger, showToast, t]);

  const handleOpenQualityAuditLogInvestigation = useCallback((log: AuditLog) => {
    const related = qualityAuditLogs.filter(l => (l.ip === log.ip && l.ip !== '10.0.0.1') || (l.userId === log.userId && l.userId !== 'unknown')).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setAuditLogInvestigationData({ targetLog: log, relatedLogs: related, riskScore: log.severity === 'CRITICAL' ? 85 : 20 });
    setIsAuditLogInvestigationModalOpen(true);
  }, [qualityAuditLogs]);

  return {
    qualityAuditLogs,
    loadingAuditLogs,
    auditLogSearch,
    setAuditLogSearch,
    auditLogSeverityFilter,
    setAuditLogSeverityFilter,
    isAuditLogInvestigationModalOpen,
    setIsAuditLogInvestigationModalOpen,
    auditLogInvestigationData,
    handleOpenQualityAuditLogInvestigation,
  };
};
