const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const {
  searchArchive,
  getItemBySlug,
  toggleLike,
  toggleBookmark,
  addMemory,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/entertainmentController');

// Every archive route requires an authenticated user, like the rest of the API.
router.use(verifyToken);

// Reads
router.get('/items', searchArchive);
router.get('/items/:slug', getItemBySlug);

// Likes & bookmarks
router.post('/items/:id/like', toggleLike);
router.post('/items/:id/bookmark', toggleBookmark);

// Community memories
router.post('/items/:id/memories', addMemory);

// Admin content management
router.post('/items', checkRole('admin'), createItem);
router.put('/items/:id', checkRole('admin'), updateItem);
router.delete('/items/:id', checkRole('admin'), deleteItem);

module.exports = router;
