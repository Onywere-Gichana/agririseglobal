const express = require('express');
const router = express.Router();
const { register, login, me, createUser, listUsers, updateUser, deleteUser } = require('../controllers/authController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/register', register); // Only for first admin
router.post('/login', login);
router.get('/me', auth, me);

// Admin only routes
router.post('/users', admin, createUser);
router.get('/users', admin, listUsers);
router.put('/users/:id', admin, updateUser);
router.delete('/users/:id', admin, deleteUser);

module.exports = router;
