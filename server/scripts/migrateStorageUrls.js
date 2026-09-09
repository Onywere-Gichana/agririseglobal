const pool = require('../config/db');

const publicBaseUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
const serverBaseUrl = (process.env.SERVER_URL || '').replace(/\/$/, '');

if (!publicBaseUrl) throw new Error('R2_PUBLIC_URL is not set in server/.env');

function migrateUrl(value) {
  if (!value || typeof value !== 'string') return value;

  let migrated = value;
  if (serverBaseUrl) {
    migrated = migrated.replaceAll(`${serverBaseUrl}/api/uploads/object/`, `${publicBaseUrl}/`);
  }
  migrated = migrated.replaceAll('/api/uploads/object/', `${publicBaseUrl}/`);
  return migrated.replaceAll(`${publicBaseUrl}/uploads/uploads/`, `${publicBaseUrl}/uploads/`);
}

function migrateContent(value) {
  if (!value) return value;

  let document;
  try {
    document = typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return value;
  }

  let changed = false;
  const blocks = (document.blocks || []).map((block) => {
    const data = { ...(block.data || {}) };
    const imageUrl = data.file?.url;
    const migratedUrl = migrateUrl(imageUrl);
    if (migratedUrl !== imageUrl) {
      data.file = { ...data.file, url: migratedUrl };
      changed = true;
    }
    return { ...block, data };
  });

  return changed ? JSON.stringify({ ...document, blocks }) : value;
}

async function migrate() {
  const result = await pool.query('SELECT id, content, featured_image FROM posts');
  let updated = 0;

  for (const post of result.rows) {
    const content = migrateContent(post.content);
    const featuredImage = migrateUrl(post.featured_image);
    if (content !== post.content || featuredImage !== post.featured_image) {
      await pool.query(
        'UPDATE posts SET content = $1, featured_image = $2, updated_at = NOW() WHERE id = $3',
        [content, featuredImage, post.id]
      );
      updated += 1;
    }
  }

  console.log(`Migrated storage URLs for ${updated} post(s).`);
}

migrate()
  .catch((error) => {
    console.error('Storage URL migration failed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());