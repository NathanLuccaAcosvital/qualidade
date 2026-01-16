import { ID, ISO8601Date } from './common.ts';
import { SteelBatchMetadata } from './metallurgy.ts';
import { FileType } from './enums.ts';

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
  isFavorite: boolean;
  metadata?: SteelBatchMetadata;
  isSelected?: boolean; 
}

export interface LibraryFilters {
  search?: string;
  status?: string;
  startDate?: ISO8601Date;
  endDate?: ISO8601Date;
}

export interface BreadcrumbItem {
  id: ID | null;
  name: string;
}
