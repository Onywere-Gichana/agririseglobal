const axios = require('axios');
const pool = require('../config/db');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const DOMPurify = createDOMPurify(new JSDOM('').window);

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const toEditorDocument = (html) => ({
  time: Date.now(),
  blocks: [{ type: 'raw', data: { html: DOMPurify.sanitize(html || '', { ADD_ATTR: ['target'] }) } }],
  version: '2.31.0',
});

const extractExcerpt = (document) => {
  const plain = (document.blocks[0]?.data?.html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > 300 ? `${plain.slice(0, 300)}…` : plain;
};

// Fetch featured image URL from WP media endpoint
const fetchFeaturedImage = async (mediaId, siteUrl) => {
  if (!mediaId) return null;
  try {
    const res = await axios.get(`${siteUrl}/wp-json/wp/v2/media/${mediaId}`);
    return res.data.source_url || null;
  } catch {
    return null;
  }
};

// Sync posts from WordPress
const syncFromWordPress = async (req, res) => {
  const siteUrl = process.env.WP_SITE_URL;
  const wpUsername = process.env.WP_USERNAME;
  const wpPassword = process.env.WP_APP_PASSWORD;
  
  if (!siteUrl || siteUrl === 'https://your-wordpress-site.com' || siteUrl.trim() === '') {
    return res.status(400).json({ error: 'WordPress site URL not configured. Please set WP_SITE_URL in server/.env file.' });
  }
  
  if (!wpUsername || !wpPassword || wpUsername.trim() === '' || wpPassword.trim() === '') {
    return res.status(400).json({ error: 'WordPress credentials not configured. Please set WP_USERNAME and WP_APP_PASSWORD in server/.env file.' });
  }

  try {
    const wpRes = await axios.get(`${siteUrl}/wp-json/wp/v2/posts`, {
      params: { per_page: 100, status: 'publish' },
      auth:
        process.env.WP_USERNAME && process.env.WP_APP_PASSWORD
          ? { username: process.env.WP_USERNAME, password: process.env.WP_APP_PASSWORD }
          : undefined,
    });

    const wpPosts = wpRes.data;
    let synced = 0;

    for (const wp of wpPosts) {
      const title = wp.title.rendered;
      const content = wp.content.rendered;
      const document = toEditorDocument(content);
      const slug = wp.slug || slugify(title);
      const featuredImage = await fetchFeaturedImage(wp.featured_media, siteUrl);
      const wpPostId = wp.id;
      const createdAt = wp.date;

      // Upsert: update if wp_post_id exists, otherwise insert
      const existing = await pool.query(
        'SELECT id FROM posts WHERE wp_post_id = $1',
        [wpPostId]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          'UPDATE posts SET title = $1, content = $2, excerpt = $3, featured_image = $4, updated_at = NOW() WHERE wp_post_id = $5',
          [title, JSON.stringify(document), extractExcerpt(document), featuredImage, wpPostId]
        );
      } else {
        // Ensure unique slug
        let finalSlug = slug;
        const slugCheck = await pool.query('SELECT id FROM posts WHERE slug = $1', [slug]);
        if (slugCheck.rows.length > 0) {
          finalSlug = `${slug}-wp-${wpPostId}`;
        }

        // WordPress posts default to generic; admins can manually categorize
        let category = 'generic';

        await pool.query(
          "INSERT INTO posts (title, content, excerpt, slug, featured_image, category, source, wp_post_id, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, 'wordpress', $7, 'draft', $8)",
          [title, JSON.stringify(document), extractExcerpt(document), finalSlug, featuredImage, category, wpPostId, createdAt]
        );
      }
      synced++;
    }

    res.json({ message: `Synced ${synced} posts from WordPress` });
  } catch (err) {
    console.error('WordPress sync error:', err.message);
    if (err.response) {
      // Axios error with response
      const status = err.response.status;
      const message = err.response.data?.message || err.message;
      if (status === 401) {
        return res.status(401).json({ error: 'WordPress authentication failed. Check WP_USERNAME and WP_APP_PASSWORD in .env' });
      }
      if (status === 404) {
        return res.status(404).json({ error: 'WordPress REST API not found. Check WP_SITE_URL in .env' });
      }
      return res.status(status).json({ error: `WordPress API error: ${message}` });
    }
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      return res.status(400).json({ error: 'Cannot connect to WordPress site. Check WP_SITE_URL in .env' });
    }
    res.status(500).json({ error: 'Failed to sync from WordPress', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
};

module.exports = { syncFromWordPress };
