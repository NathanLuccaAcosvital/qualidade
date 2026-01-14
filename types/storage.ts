
import { ID, ISO8601Date } from './common.ts';
import { SteelBatchMetadata } from './metallurgy.ts';

// Renamed from StorageItemType to FileType
export enum FileType {
  FOLDER = 'FOLDER',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER'
}

// Renamed from StorageNode to FileNode
export interface FileNode {
  id: ID;
  parentId: ID | null;
  name: string;
  type: FileType;
  size?: string;
  updatedAt: ISO8601Date;
  ownerId?: ID;
  storagePath: string;
  isFavorite: boolean;
  metadata?: SteelBatchMetadata;
}

// Renamed from RepositoryFilters to LibraryFilters
export interface LibraryFilters {
  search?: string;
  status?: string;
  startDate?: ISO8601Date;
  endDate?: ISO8601Date;
}

// Renamed from Breadcrumb to BreadcrumbItem
export interface BreadcrumbItem {
  id: ID | null;
  name: string;
}
