import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsApi } from '../services/api';
import EditorJsRenderer from '../components/EditorJsRenderer';

function AuthorAvatar({ image, name }) {
  return image ? <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" /> : <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center" aria-label={`${name || 'Author'} profile placeholder`}><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v3h16v-3c0-2.76-3.58-5-8-5Z" /></svg></span>;
}

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
        <div className="flex items-center gap-3 text-slate-500 text-sm mb-6">
          {post.author_id ? <Link to={`/users/${post.author_id}`} title={`View ${post.author_name || 'author'}'s profile`}><AuthorAvatar image={post.author_profile_image} name={post.author_name} /></Link> : <AuthorAvatar name="Admin" />}
          <span>By {post.author_name || 'Admin'} &middot; {new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <EditorJsRenderer content={post.content} />
      </article>
      <p className="mt-8">
        <Link to="/blog" className="text-blue-600 hover:underline">← Back to blog</Link>
      </p>
    </main>
  );
}
