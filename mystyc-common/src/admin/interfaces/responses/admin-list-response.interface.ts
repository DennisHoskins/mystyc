export interface AdminQuery {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Pagination {
  limit: number;
  offset: number;
  totalItems: number;
  totalPages: number;
  hasMore?: boolean;
}

export interface AdminListResponse<T> {
  data: T[];
  pagination: Pagination;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}