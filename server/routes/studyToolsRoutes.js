const router = require('express').Router();
const c = require('../controllers/studyToolsController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/today', c.getTodayLog);
router.put('/today', c.updateLog);
router.get('/streak', c.getStreak);
router.get('/week-stats', c.getWeekStats);

module.exports = router;
