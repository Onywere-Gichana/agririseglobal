import { useState } from 'react';
import { Link } from 'react-router-dom';
import { wordpressApi } from '../services/api';

export default function WordPressSync() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const data = await wordpressApi.sync();
      setMessage(data.message || 'Sync completed.');
    } catch (err) {
      setError(err.error || err.message || 'Sync failed. Check WordPress URL and credentials in server .env.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">WordPress sync</h1>
      <p className="text-slate-600 mb-6">
        Fetch posts from your WordPress site (headless CMS). Configure <code className="bg-slate-100 px-1 rounded">WP_SITE_URL</code>,{' '}
        <code className="bg-slate-100 px-1 rounded">WP_USERNAME</code>, and{' '}
        <code className="bg-slate-100 px-1 rounded">WP_APP_PASSWORD</code> in the server <code className="bg-slate-100 px-1 rounded">.env</code>.
      </p>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="px-4 py-2 bg-slate-800 text-white rounded font-medium hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? 'Syncing...' : 'Sync from WordPress'}
      </button>
      <p className="mt-6">
        <Link to="/admin/dashboard" className="text-blue-600 hover:underline">← Back to dashboard</Link>
      </p>
    </main>
  );
}
