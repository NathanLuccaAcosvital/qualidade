export enum FileType {
  FOLDER = 'FOLDER',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER'
}

export interface FileMetadata {
  batchNumber?: string;
  productName?: string;
  invoiceNumber?: string;
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  rejectionReason?: string;
  inspectedAt?: string;
  inspectedBy?: string;
}

export interface FileNode {
  id: string;
  parentId: string | null;
  name: string;
  type: FileType;
  size?: string;
  updatedAt: string;
  ownerId?: string;
  tags?: string[];
  metadata?: FileMetadata;
  isFavorite?: boolean;
  // Fix: Added storage_path to FileNode interface
  storage_path?: string; 
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export interface LibraryFilters {
  startDate?: string;
  endDate?: string;
  status: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
  search: string;
}