const pool = require('./db');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initDb = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'author' CHECK (role IN ('admin', 'author')),
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);

        // Add role column if it doesn't exist (for existing databases)
        await client.query(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name='users' AND column_name='role') THEN
              ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'author' CHECK (role IN ('admin', 'author'));
              -- Set first user as admin
              UPDATE users SET role = 'admin' WHERE id = (SELECT MIN(id) FROM users);
            END IF;
          END $$;
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            content TEXT NOT NULL,
            slug VARCHAR(500) UNIQUE NOT NULL,
            featured_image TEXT,
            category VARCHAR(50) DEFAULT 'general',
            source VARCHAR(20) DEFAULT 'native' CHECK (source IN ('native', 'wordpress')),
            wp_post_id INTEGER,
            status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);

        // Add category column if it doesn't exist (for existing databases)
        await client.query(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name='posts' AND column_name='category') THEN
              ALTER TABLE posts ADD COLUMN category VARCHAR(50) DEFAULT 'general';
            END IF;
          END $$;
        `);

        await client.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns
              WHERE table_name='posts' AND column_name='excerpt') THEN
              ALTER TABLE posts ADD COLUMN excerpt TEXT DEFAULT '';
            END IF;
          END $$;
        `);

        console.log('Database tables initialized successfully');
      } finally {
        client.release();
      }
      return;
    } catch (err) {
      console.error(`Database connection attempt ${i + 1}/${retries}:`, err.message);
      if (i === retries - 1) throw err;
      await sleep(2000);
    }
  }
};

module.exports = initDb;
