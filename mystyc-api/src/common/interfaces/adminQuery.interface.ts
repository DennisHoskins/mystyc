export interface AdminQuery {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminListResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    totalItems: number;
    totalPages: number;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}