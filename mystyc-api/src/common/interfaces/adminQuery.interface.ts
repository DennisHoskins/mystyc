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
    total?: number;
    hasMore?: boolean;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}