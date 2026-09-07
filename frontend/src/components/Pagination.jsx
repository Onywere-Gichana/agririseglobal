import { Link } from 'react-router-dom';

export default function Pagination({ page, totalPages, basePath = '/blog', query = {} }) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const buildUrl = (targetPage) => {
    const params = new URLSearchParams({ ...query, page: String(targetPage) });
    if (targetPage === 1) params.delete('page');
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  return (
    <nav className="flex justify-center gap-3 mt-8 items-center" aria-label="Pagination">
      {prev ? (
        <Link
          to={buildUrl(prev)}
          className="px-4 py-2 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 shadow-sm"
        >
          ← Previous
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-md bg-slate-50 text-slate-400 cursor-not-allowed">← Previous</span>
      )}
      <span className="px-4 py-2 text-slate-600">Page {page} of {totalPages}</span>
      {next ? (
        <Link
          to={buildUrl(next)}
          className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700 shadow-sm"
        >
          Next →
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-md bg-slate-50 text-slate-400 cursor-not-allowed">Next →</span>
      )}
    </nav>
  );
}
