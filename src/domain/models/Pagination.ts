export interface PaginationMeta {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface GameFilterOptions {
  page: number;
  limit: number;
  genre?: string;
  search?: string;
  sort?: 'recent' | 'popular';
}
