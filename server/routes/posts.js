const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostBySlug,
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', getPosts);
router.get('/slug/:slug', getPostBySlug);

// Admin routes (protected)
router.get('/admin/all', auth, getAllPosts);
router.get('/admin/:id', auth, getPostById);
router.post('/', auth, createPost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

module.exports = router;
