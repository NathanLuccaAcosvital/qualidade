
import { FileNode, FileType, QualityStatus } from '../../types/index.ts';

/**
 * FILE MAPPER - AÇOS VITAL
 * Converte dados brutos do banco de dados para entidades de domínio.
 */
export const toDomainFile = (row: any): FileNode => {
  if (!row) throw new Error("Entrada inválida para mapeamento de arquivo");

  // Handle both singular and plural (array) joined organization results from Supabase
  // PostgREST return formats can vary based on cardinality and specific !constraint syntax
  const orgData = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
  const authorData = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    type: (row.type as FileType) || FileType.OTHER,
    size: row.size || '--',
    mimeType: row.mime_type,
    updatedAt: row.updated_at,
    ownerId: row.owner_id,
    storagePath: row.storage_path,
    isFavorite: !!row.is_favorite,
    authorName: authorData?.full_name || 'Sistema',
    versionNumber: row.version_number || 1,
    organizationName: orgData?.name,
    metadata: row.metadata ? {
      batchNumber: row.metadata.batchNumber || '',
      grade: row.metadata.grade || '',
      invoiceNumber: row.metadata.invoiceNumber || '',
      currentStep: row.metadata.currentStep || 1,
      status: (row.metadata.status as QualityStatus) || QualityStatus.PENDING,
      chemicalComposition: row.metadata.chemicalComposition || {
        carbon: 0, manganese: 0, silicon: 0, phosphorus: 0, sulfur: 0
      },
      mechanicalProperties: row.metadata.mechanicalProperties || {
        yieldStrength: 0, tensileStrength: 0, elongation: 0
      },
      ...row.metadata
    } : undefined
  };
};
