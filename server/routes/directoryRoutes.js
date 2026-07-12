const router = require('express').Router();
const c = require('../controllers/directoryController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', c.getDirectory);
router.get('/me', c.getMyProfile);
router.put('/me', c.upsertMyProfile);

module.exports = router;
