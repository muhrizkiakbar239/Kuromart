export function parsePagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(query.limit, 10) || 8));
  return { page, limit, from: (page - 1) * limit, to: (page - 1) * limit + limit - 1 };
}
