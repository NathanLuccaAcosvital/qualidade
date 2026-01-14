
/**
 * Common Types (Foundation)
 * Contém tipos primitivos e estruturas reutilizáveis.
 */

export type ID = string;
export type ISO8601Date = string;
export type CNPJ = string;

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export type StatusColor = 'success' | 'error' | 'warning' | 'info' | 'neutral';
