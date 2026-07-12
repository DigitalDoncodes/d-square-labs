const router = require('express').Router();
const c = require('../controllers/notificationController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', c.list);
router.patch('/read-all', c.markAllRead);
router.patch('/:id/read', c.markRead);
router.delete('/:id', c.remove);

module.exports = router;
