const router = require('express').Router();
const { getMyResume, saveResume } = require('../controllers/resumeController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', getMyResume);
router.put('/', saveResume);

module.exports = router;
