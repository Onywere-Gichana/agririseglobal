import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsApi } from '../services/api';

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    postsApi
      .getBySlug(slug)
      .then((res) => {
        if (!cancelled) setPost(res.post);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Post not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <main className="max-w-3xl mx-auto px-4 py-12"><p className="text-slate-500">Loading...</p></main>;
  if (error) return <main className="max-w-3xl mx-auto px-4 py-12"><p className="text-red-600">{error}</p><Link to="/blog" className="text-blue-600 hover:underline">Back to blog</Link></main>;
  if (!post) return null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <article>
        {post.featured_image && (
          <img src={post.featured_image} alt={post.title} className="w-full rounded-lg shadow-md mb-6" />
        )}
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{post.title}</h1>
        <p className="text-slate-500 text-sm mb-6">
          {new Date(post.created_at).toLocaleDateString()}
          {post.source === 'wordpress' && <span className="ml-2 text-slate-400">· From WordPress</span>}
        </p>
        <div
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
      <p className="mt-8">
        <Link to="/blog" className="text-blue-600 hover:underline">← Back to blog</Link>
      </p>
    </main>
  );
}
