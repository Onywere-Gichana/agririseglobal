const pool = require('../config/db');

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Public: list published posts (paginated)
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category;

    let countQuery = "SELECT COUNT(*) FROM posts WHERE status = 'published'";
    let dataQuery = "SELECT id, title, slug, featured_image, category, source, status, created_at, updated_at, LEFT(content, 300) AS excerpt FROM posts WHERE status = 'published'";
    const queryParams = [];

    if (category && category !== 'all') {
      countQuery += " AND category = $1";
      dataQuery += " AND category = $1";
      queryParams.push(category);
    }

    dataQuery += " ORDER BY created_at DESC LIMIT $" + (queryParams.length + 1) + " OFFSET $" + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const countResult = await pool.query(countQuery, category && category !== 'all' ? [category] : []);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(dataQuery, queryParams);

    res.json({
      posts: result.rows,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Public: get single post by slug
const getPostBySlug = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM posts WHERE slug = $1 AND status = 'published'",
      [req.params.slug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: list all posts (including drafts)
const getAllPosts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, slug, featured_image, category, source, status, created_at, updated_at FROM posts ORDER BY created_at DESC'
    );
    res.json({ posts: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: get single post by id (full content for editing)
const getPostById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: create post
const createPost = async (req, res) => {
  try {
    const { title, content, featured_image, category, status } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    let slug = slugify(title);
    // Ensure unique slug
    const existing = await pool.query('SELECT id FROM posts WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const result = await pool.query(
      'INSERT INTO posts (title, content, slug, featured_image, category, status, source) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, content, slug, featured_image || null, category || 'general', status || 'draft', 'native']
    );

    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: update post
const updatePost = async (req, res) => {
  try {
    const { title, content, featured_image, category, status } = req.body;
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = existing.rows[0];
    const newTitle = title || post.title;
    const newContent = content || post.content;
    const newImage = featured_image !== undefined ? featured_image : post.featured_image;
    const newCategory = category !== undefined ? category : (post.category || 'general');
    const newStatus = status || post.status;

    const result = await pool.query(
      'UPDATE posts SET title = $1, content = $2, featured_image = $3, category = $4, status = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [newTitle, newContent, newImage, newCategory, newStatus, id]
    );

    res.json({ post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: delete post
const deletePost = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getPosts, getPostBySlug, getAllPosts, getPostById, createPost, updatePost, deletePost };
