export function parsePagination(query) {
  let page = Number.parseInt(String(query.page ?? "1"), 10);
  if (!Number.isInteger(page) || page < 1) page = 1;

  let pageSize = Number.parseInt(String(query.pageSize ?? "10"), 10);
  if (!Number.isInteger(pageSize) || pageSize < 1) pageSize = 10;
  if (pageSize > 100) pageSize = 100;

  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

export function buildPageMeta(total, page, pageSize) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  return { total, page, pageSize, totalPages };
}
