import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuditLogsTable } from '../../admin/components/AuditLogsTable.tsx';
import { AuditLogToolbar } from '../components/QualityAuditControls.tsx';
import { InvestigationModal } from '../components/InvestigationModal.tsx';
import { QualityLoadingState, QualityEmptyState } from '../components/ViewStates.tsx';
import { useQualityAuditLogs } from '../hooks/useQualityAuditLogs.ts';

/**
 * QualityAuditLog (Orchestrator View)
 * Refatorado para remover o "efeito caixa" e integrar-se ao grid global.
 */
export const QualityAuditLog: React.FC = () => {
  const { t } = useTranslation();
  const {
    qualityAuditLogs, loadingAuditLogs, auditLogSearch, setAuditLogSearch,
    auditLogSeverityFilter, setAuditLogSeverityFilter, isAuditLogInvestigationModalOpen,
    setIsAuditLogInvestigationModalOpen, auditLogInvestigationData,
    handleOpenQualityAuditLogInvestigation,
  } = useQualityAuditLogs(0);

  if (loadingAuditLogs) {
    return <QualityLoadingState message="Acessando Registros de Auditoria..." />;
  }

  if (qualityAuditLogs.length === 0 && !auditLogSearch) {
    return <QualityEmptyState message={t('quality.noQualityLogsFound')} />;
  }

  return (
    <div className="flex flex-col h-full gap-8 animate-in fade-in duration-500">
      <InvestigationModal 
        isOpen={isAuditLogInvestigationModalOpen}
        onClose={() => setIsAuditLogInvestigationModalOpen(false)}
        data={auditLogInvestigationData}
        t={t}
      />

      {/* Toolbar superior agora integrada diretamente ao layout */}
      <div className="shrink-0 px-1">
        <AuditLogToolbar 
          search={auditLogSearch}
          onSearchChange={setAuditLogSearch}
          severity={auditLogSeverityFilter}
          onSeverityChange={setAuditLogSeverityFilter}
          t={t}
        />
      </div>

      {/* Tabela de logs integrada ao fundo da página */}
      <div className="flex-1 min-h-0">
        <AuditLogsTable
          logs={qualityAuditLogs}
          severityFilter={auditLogSeverityFilter}
          onSeverityChange={(sev) => setAuditLogSeverityFilter(sev as any)}
          onInvestigate={handleOpenQualityAuditLogInvestigation}
        />
      </div>
    </div>
  );
};