const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const { listAnnouncements } = require('../controllers/announcementController');

router.use(verifyToken);
router.get('/', listAnnouncements);

module.exports = router;
