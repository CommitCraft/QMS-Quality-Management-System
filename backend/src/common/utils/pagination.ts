export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
}

export const parsePagination = (query: PaginationQuery) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset, search: (query.search || '').trim(), status: (query.status || '').trim() };
};