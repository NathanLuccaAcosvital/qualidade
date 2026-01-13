import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { AuditLog } from '../../../types/index';
import { fileService } from '../../../lib/services/index.ts';

export const useAdminAuditLogs = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'>('ALL');

  // Investigation Modal State
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [investigationData, setInvestigationData] = useState<{ targetLog: AuditLog | null; relatedLogs: AuditLog[]; riskScore: number; }>({ targetLog: null, relatedLogs: [], riskScore: 0 });

  const loadLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      if (user) {
        const auditLogs = await fileService.getAuditLogs(user);
        setLogs(auditLogs);
      }
    } catch (err: any) {
      console.error("[useAdminAuditLogs] Erro ao carregar logs de auditoria:", err.message);
      showToast(`Erro ao carregar logs de auditoria: ${err.message}`, 'error');
    } finally {
      setIsLoadingLogs(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user, loadLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || l.action.toLowerCase().includes(searchTerm.toLowerCase()) || l.target.toLowerCase().includes(searchTerm.toLowerCase()) || l.ip.includes(searchTerm);
      const matchesSeverity = severityFilter === 'ALL' || l.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [logs, searchTerm, severityFilter]);

  const handleOpenInvestigation = useCallback((log: AuditLog) => {
    const related = logs.filter(l => (l.ip === log.ip && l.ip !== '10.0.0.1') || (l.userId === log.userId && l.userId !== 'unknown')).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setInvestigationData({ targetLog: log, relatedLogs: related, riskScore: log.severity === 'CRITICAL' ? 85 : 20 });
    setIsInvestigationModalOpen(true);
  }, [logs]);

  return {
    filteredLogs,
    isLoadingLogs,
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    isInvestigationModalOpen,
    setIsInvestigationModalOpen,
    investigationData,
    handleOpenInvestigation,
  };
};