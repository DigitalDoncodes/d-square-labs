const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const {
  listArticles,
  listBookmarked,
  toggleBookmark,
  refresh,
  setInterests,
  getMarket,
  setMarket,
} = require('../controllers/intelligenceController');

router.use(verifyToken);

// Read / personalization (all users)
router.get('/', listArticles);
router.get('/market', getMarket);
router.get('/bookmarks', listBookmarked);
router.post('/:id/bookmark', toggleBookmark);
router.put('/interests', setInterests);

// Admin
router.post('/refresh', checkRole('admin'), refresh);
router.put('/market', checkRole('admin'), setMarket);

module.exports = router;
