const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

const migrateCategories = async () => {
  try {
    console.log('Starting category migration...');
    
    // Update all posts with old categories to 'generic'
    const oldCategories = [
      'farming-products',
      'education',
      'crop-management',
      'livestock',
      'sustainable-farming',
      'general'
    ];

    for (const oldCategory of oldCategories) {
      const result = await pool.query(
        'UPDATE posts SET category = $1 WHERE category = $2',
        ['generic', oldCategory]
      );
      console.log(`Updated ${result.rowCount} posts from '${oldCategory}' to 'generic'`);
    }

    console.log('Category migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

migrateCategories();
