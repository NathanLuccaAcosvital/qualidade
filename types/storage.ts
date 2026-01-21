
import { ID, ISO8601Date } from './common.ts';
import { SteelBatchMetadata } from './metallurgy.ts';
import { FileType } from './enums.ts';

export interface FileVersionInfo {
  id: ID;
  versionNumber: number;
  updatedAt: ISO8601Date;
  updatedBy: string;
  status: string;
  storagePath: string;
}

export interface FileNode {
  id: ID;
  parentId: ID | null;
  name: string;
  type: FileType;
  size?: string;
  mimeType?: string;
  updatedAt: ISO8601Date;
  ownerId?: ID;
  storagePath: string;
  isFavorite?: boolean;
  metadata?: SteelBatchMetadata;
  isSelected?: boolean;
  
  // Metadados de Sistema
  authorName?: string;
  lastModifierName?: string;
  versionNumber?: number;
  organizationName?: string;
}

export interface FileFilters {
  search?: string;
  type?: FileType | 'ALL';
  modifiedAfter?: ISO8601Date;
  ownerId?: string;
  status?: string;
}

export interface BreadcrumbItem {
  id: ID | null;
  name: string;
}
