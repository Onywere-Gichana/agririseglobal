const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/db');

const testPosts = [
  {
    title: 'Introduction to Sustainable Farming Practices',
    content: '<p>Sustainable farming is an approach to agriculture that focuses on long-term productivity while minimizing environmental impact. This comprehensive guide covers the fundamental principles of sustainable agriculture, including crop rotation, organic fertilizers, and water conservation techniques.</p><p>By implementing these practices, farmers can improve soil health, reduce chemical inputs, and create a more resilient farming system that benefits both the environment and their bottom line.</p>',
    category: 'generic',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
  },
  {
    title: 'Best Practices for Crop Management in 2026',
    content: '<p>Effective crop management is essential for maximizing yields and ensuring food security. This article explores modern crop management techniques including precision agriculture, integrated pest management, and soil health monitoring.</p><p>Learn about the latest tools and technologies that can help you optimize your crop production while reducing costs and environmental impact.</p>',
    category: 'generic',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800',
  },
  {
    title: 'Essential Farming Products for Modern Agriculture',
    content: '<p>Discover the must-have farming products that every agricultural operation needs. From high-quality seeds and fertilizers to advanced irrigation systems and farm machinery, we review the top products that can enhance your farming efficiency.</p><p>Whether you\'re running a small family farm or a large commercial operation, having the right tools and products is crucial for success.</p>',
    category: 'generic',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
  },
  {
    title: 'Livestock Health Management: A Complete Guide',
    content: '<p>Maintaining healthy livestock is crucial for any farming operation. This comprehensive guide covers everything you need to know about livestock health management, including vaccination schedules, nutrition requirements, and disease prevention strategies.</p><p>Learn how to recognize early signs of illness, implement effective biosecurity measures, and ensure your animals receive the best possible care.</p>',
    category: 'generic',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800',
  },
  {
    title: 'Agricultural Education: Building Knowledge for Future Farmers',
    content: '<p>Education is the foundation of successful agriculture. This article highlights the importance of agricultural education and provides resources for farmers looking to expand their knowledge and skills.</p><p>From online courses and workshops to hands-on training programs, discover the best ways to stay updated with the latest agricultural practices and technologies.</p>',
    category: 'generic',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
  },
  {
    title: 'Organic Fertilizers: Natural Solutions for Soil Health',
    content: '<p>Organic fertilizers offer a natural alternative to synthetic options, providing essential nutrients while improving soil structure and microbial activity. This guide explores different types of organic fertilizers and how to use them effectively.</p><p>Learn about compost, manure, green manures, and other organic amendments that can enhance your soil fertility naturally.</p>',
    category: 'generic',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
  },
  {
    title: 'Poultry Farming: Getting Started with Chickens',
    content: '<p>Poultry farming can be a rewarding venture for both small-scale and commercial farmers. This beginner\'s guide covers everything you need to know about raising chickens, from housing and feeding to health management and egg production.</p><p>Discover the basics of poultry care, common challenges, and tips for running a successful chicken operation.</p>',
    category: 'generic',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800',
  },
  {
    title: 'Irrigation Systems: Choosing the Right Solution',
    content: '<p>Proper irrigation is essential for crop success, especially in areas with limited rainfall. This article compares different irrigation systems including drip irrigation, sprinkler systems, and flood irrigation.</p><p>Learn about the pros and cons of each system, water efficiency considerations, and how to choose the best irrigation solution for your specific needs and budget.</p>',
    category: 'generic',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
  },
  {
    title: 'Understanding Soil pH and Nutrient Management',
    content: '<p>Soil pH plays a critical role in nutrient availability and crop growth. This educational article explains how to test and adjust soil pH, understand nutrient interactions, and develop effective fertilization strategies.</p><p>Whether you\'re growing vegetables, grains, or fruits, understanding your soil chemistry is key to achieving optimal yields.</p>',
    category: 'generic',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
  },
  {
    title: 'Permaculture Principles for Sustainable Agriculture',
    content: '<p>Permaculture offers a holistic approach to farming that works with nature rather than against it. This guide introduces the core principles of permaculture and how they can be applied to create more sustainable and productive agricultural systems.</p><p>Learn about design principles, companion planting, and how to create self-sustaining farm ecosystems.</p>',
    category: 'generic',
    status: 'published',
    featured_image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
  },
];

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function createTestPosts() {
  const client = await pool.connect();
  try {
    console.log('Creating test posts...\n');
    
    for (const post of testPosts) {
      let slug = slugify(post.title);
      
      // Check if slug exists
      const existing = await client.query('SELECT id FROM posts WHERE slug = $1', [slug]);
      if (existing.rows.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
      
      await client.query(
        `INSERT INTO posts (title, content, slug, featured_image, category, status, source, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, 'native', NOW()) 
         ON CONFLICT (slug) DO NOTHING`,
        [post.title, post.content, slug, post.featured_image, post.category, post.status]
      );
      
      console.log(`✓ Created: ${post.title} (${post.category})`);
    }
    
    console.log(`\n✅ Successfully created ${testPosts.length} test posts!`);
  } catch (err) {
    console.error('Error creating test posts:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

createTestPosts();
