
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuditLogsTable } from '../../admin/components/AuditLogsTable.tsx';
import { AuditLogToolbar } from '../components/QualityAuditControls.tsx';
import { InvestigationModal } from '../components/InvestigationModal.tsx';
import { QualityLoadingState, QualityEmptyState } from '../components/ViewStates.tsx';
import { useQualityAuditLogs } from '../hooks/useQualityAuditLogs.ts';

/**
 * QualityAuditLog (Orchestrator View)
 */
export const QualityAuditLog: React.FC = () => {
  const { t } = useTranslation();
  const {
    qualityAuditLogs, loadingAuditLogs, auditLogSearch, setAuditLogSearch,
    auditLogSeverityFilter, setAuditLogSeverityFilter, isAuditLogInvestigationModalOpen,
    setIsAuditLogInvestigationModalOpen, auditLogInvestigationData,
    handleOpenQualityAuditLogInvestigation,
  } = useQualityAuditLogs(0);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      <InvestigationModal 
        isOpen={isAuditLogInvestigationModalOpen}
        onClose={() => setIsAuditLogInvestigationModalOpen(false)}
        data={auditLogInvestigationData}
        t={t}
      />

      <AuditLogToolbar 
        search={auditLogSearch}
        onSearchChange={setAuditLogSearch}
        severity={auditLogSeverityFilter}
        onSeverityChange={setAuditLogSeverityFilter}
        t={t}
      />

      {loadingAuditLogs ? (
        <QualityLoadingState message="Acessando Registros de Auditoria..." />
      ) : qualityAuditLogs.length === 0 ? (
        <QualityEmptyState message={t('quality.noQualityLogsFound')} />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <AuditLogsTable
                logs={qualityAuditLogs}
                severityFilter={auditLogSeverityFilter}
                onSeverityChange={setAuditLogSeverityFilter}
                onInvestigate={handleOpenQualityAuditLogInvestigation}
            />
        </div>
      )}
    </div>
  );
};
