export default function PaginationBar({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  idPrefix,
  noun = "items",
}) {
  if (totalPages <= 1 && total === 0) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav className="pagination" aria-label={`${noun} pagination`}>
      <span className="pagination__info" id={`${idPrefix}-info`}>
        {total === 0 ? `No ${noun}` : `${from}–${to} of ${total} ${noun}`}
      </span>
      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          Prev
        </button>
        <span className="pagination__page" aria-live="polite">
          Page {totalPages === 0 ? 0 : page} / {totalPages || 1}
        </span>
        <button
          type="button"
          className="pagination__btn"
          disabled={page >= totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
