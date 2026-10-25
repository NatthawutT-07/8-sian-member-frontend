export default function AdminPagination({ data, busy, onPage }) {
  return (
    data.pages > 1 && (
      <div className="admin-pagination">
        <button
          className="admin-secondary"
          onClick={() => onPage(data.page - 1)}
          disabled={busy || data.page <= 1}
        >
          ก่อนหน้า
        </button>
        <span>
          {data.page} / {data.pages}
        </span>
        <button
          className="admin-secondary"
          onClick={() => onPage(data.page + 1)}
          disabled={busy || data.page >= data.pages}
        >
          ถัดไป
        </button>
      </div>
    )
  );
}
